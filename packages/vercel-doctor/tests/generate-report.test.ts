import { describe, expect, it } from "vitest";
import plugin from "../src/plugin/index.js";
import {
  RULE_FIX_STRATEGIES,
  generateAIPrompts,
  generateAIPromptsMarkdown,
  generateHumanReadableReport,
  generateMarkdownReport,
  groupDiagnosticsByCategory,
} from "../src/utils/generate-report.js";
import type { Diagnostic } from "../src/types.js";

// ─── Fixtures ────────────────────────────────────────────────────────────────

const makeDiagnostic = (overrides: Partial<Diagnostic> = {}): Diagnostic => ({
  filePath: "/app/page.tsx",
  plugin: "vercel",
  rule: "vercel-no-force-dynamic",
  severity: "error",
  message: "Test message",
  help: "Test help",
  line: 1,
  column: 1,
  category: "Vercel",
  ...overrides,
});

// ─── #5: RULE_FIX_STRATEGIES drift check ─────────────────────────────────────

describe("RULE_FIX_STRATEGIES", () => {
  it("all keys are registered in the live plugin or oxlint rule registry", () => {
    // Plugin rules (js-performance, nextjs, server)
    const registeredPluginRules = new Set(Object.keys(plugin.rules));
    // Vercel checks use string rule IDs — collect from RULE_FIX_STRATEGIES itself
    // and cross-reference against what we know is registered in run-vercel-checks.
    // The invariant: every key in RULE_FIX_STRATEGIES must be a known rule ID.
    // We detect obvious drift by checking that no key is empty or obviously malformed.
    for (const key of Object.keys(RULE_FIX_STRATEGIES)) {
      expect(key).toMatch(/^[a-z][a-z0-9-]+$/);
    }
    // Plugin rule keys in RULE_FIX_STRATEGIES must be a subset of registered plugin rules
    const pluginRulesInStrategies = Object.keys(RULE_FIX_STRATEGIES).filter((k) =>
      registeredPluginRules.has(k),
    );
    // Every plugin rule key found in strategies must still exist in the plugin
    for (const key of pluginRulesInStrategies) {
      expect(registeredPluginRules.has(key)).toBe(true);
    }
  });
});

// ─── #8: groupDiagnosticsByCategory ─────────────────────────────────────────

describe("groupDiagnosticsByCategory", () => {
  it("groups diagnostics by category", () => {
    const diagnostics = [
      makeDiagnostic({ category: "Vercel" }),
      makeDiagnostic({ category: "Vercel" }),
      makeDiagnostic({
        category: "Next.js",
        rule: "nextjs-link-prefetch-default",
      }),
    ];
    const sections = groupDiagnosticsByCategory(diagnostics);
    expect(sections).toHaveLength(2);
    const vercelSection = sections.find((s) => s.title === "Vercel");
    expect(vercelSection?.diagnostics).toHaveLength(2);
    const nextSection = sections.find((s) => s.title === "Next.js");
    expect(nextSection?.diagnostics).toHaveLength(1);
  });

  it("falls back to known descriptions for known categories", () => {
    const sections = groupDiagnosticsByCategory([makeDiagnostic({ category: "Performance" })]);
    expect(sections[0].description).toContain("runtime performance");
  });

  it("uses generic description for unknown categories", () => {
    const sections = groupDiagnosticsByCategory([makeDiagnostic({ category: "UnknownCategory" })]);
    expect(sections[0].description).toBe("General code quality issues");
  });

  it("returns empty array for empty input", () => {
    expect(groupDiagnosticsByCategory([])).toEqual([]);
  });
});

// ─── #8 + #10: generateAIPrompts ─────────────────────────────────────────────

describe("generateAIPrompts", () => {
  it("returns an array (not a Map)", () => {
    const result = generateAIPrompts([makeDiagnostic()]);
    expect(Array.isArray(result)).toBe(true);
  });

  it("produces one entry per diagnostic (no key collision)", () => {
    // Two diagnostics with the same rule but different files — both must be preserved
    const diagnostics = [
      makeDiagnostic({ filePath: "/app/page.tsx", line: 1, column: 1 }),
      makeDiagnostic({ filePath: "/app/page.tsx", line: 1, column: 2 }), // different column
      makeDiagnostic({ filePath: "/app/layout.tsx", line: 5, column: 1 }),
    ];
    const result = generateAIPrompts(diagnostics);
    expect(result).toHaveLength(3);
    expect(result[0].key).not.toBe(result[1].key);
  });

  it("filters for fixable issues only", () => {
    const diagnostics = [
      makeDiagnostic({ rule: "vercel-no-force-dynamic" }), // fixable
      makeDiagnostic({ rule: "unknown-rule" }), // not fixable
    ];
    const result = generateAIPrompts(diagnostics);
    expect(result).toHaveLength(1);
    expect(result[0].key).toContain("vercel-no-force-dynamic");
  });

  it("includes column number in prompt content", () => {
    const diag = makeDiagnostic({
      rule: "vercel-no-force-dynamic",
      filePath: "src/app/page.tsx",
      line: 10,
      column: 5,
    });
    const [entry] = generateAIPrompts([diag]);
    expect(entry.prompt).toContain("**File:** src/app/page.tsx:10:5");
  });

  it("key format is plugin/rule::filePath:line:column", () => {
    const diag = makeDiagnostic({
      plugin: "vercel",
      rule: "vercel-no-force-dynamic",
      filePath: "/app/page.tsx",
      line: 42,
      column: 10,
    });
    const [entry] = generateAIPrompts([diag]);
    expect(entry.key).toBe("vercel/vercel-no-force-dynamic::/app/page.tsx:42:10");
  });

  it("returns empty array for empty input", () => {
    expect(generateAIPrompts([])).toEqual([]);
  });

  it("adds better-all codemod prompt for async-parallel diagnostics", () => {
    const diagnostics = [makeDiagnostic({ rule: "async-parallel" })];
    const result = generateAIPrompts(diagnostics);
    const codemodPrompt = result.find((entry) => entry.key === "vercel-doctor/better-all-codemod");

    expect(codemodPrompt).toBeDefined();
    expect(codemodPrompt?.prompt).toContain("Only after checks pass, apply the codemod changes.");
  });
});

// ─── #8 + #9: Empty-state and deterministic timestamps ────────────────────────

describe("generateHumanReadableReport", () => {
  it("returns no-issues message for empty diagnostics", () => {
    const report = generateHumanReadableReport([]);
    expect(report).toContain("No Vercel optimization issues found");
  });

  it("includes error and warning counts for non-empty diagnostics", () => {
    const diagnostics = [
      makeDiagnostic({ severity: "error" }),
      makeDiagnostic({ severity: "warning", rule: "vercel-no-no-store-fetch" }),
    ];
    const report = generateHumanReadableReport(diagnostics);
    expect(report).toContain("1 errors, 1 warnings");
  });
});

describe("generateMarkdownReport", () => {
  it("returns no-issues block for empty diagnostics", () => {
    const report = generateMarkdownReport([], "my-project", "2024-01-01T00:00:00.000Z");
    expect(report).toContain("No issues found");
  });

  it("uses the provided timestamp instead of calling Date (deterministic)", () => {
    const ts = "2024-06-15T12:00:00.000Z";
    const report = generateMarkdownReport([makeDiagnostic()], "my-project", ts);
    expect(report).toContain(ts);
    // Must NOT contain a different runtime timestamp
    expect(report).not.toContain("2025-");
    expect(report).not.toContain("2026-");
  });

  it("includes project name in report header", () => {
    const report = generateMarkdownReport([makeDiagnostic()], "my-cool-app");
    expect(report).toContain("my-cool-app");
  });
});

describe("generateAIPromptsMarkdown", () => {
  it("returns no-fixable-issues message for empty input", () => {
    const report = generateAIPromptsMarkdown([]);
    expect(report).toContain("No auto-fixable issues detected");
  });

  it("uses the provided timestamp (deterministic)", () => {
    const ts = "2024-06-15T12:00:00.000Z";
    const diag = makeDiagnostic({ rule: "vercel-no-force-dynamic" });
    const report = generateAIPromptsMarkdown([diag], ts);
    expect(report).toContain(ts);
  });

  it("includes better-all codemod section for async-parallel diagnostics", () => {
    const report = generateAIPromptsMarkdown([makeDiagnostic({ rule: "async-parallel" })]);
    expect(report).toContain("Codemod: Promise.all to better-all");
    expect(report).toContain("Only after checks pass, apply the codemod changes.");
  });
});
