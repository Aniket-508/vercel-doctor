import path from "node:path";
import { describe, expect, it } from "vitest";
import type { Diagnostic } from "../src/types.js";
import { runOxlint } from "../src/utils/run-oxlint.js";

const FIXTURES_DIRECTORY = path.resolve(import.meta.dirname, "fixtures");
const BASIC_REACT_DIRECTORY = path.join(FIXTURES_DIRECTORY, "basic-react");
const NEXTJS_APP_DIRECTORY = path.join(FIXTURES_DIRECTORY, "nextjs-app");

const findDiagnosticsByRule = (diagnostics: Diagnostic[], rule: string): Diagnostic[] =>
  diagnostics.filter((diagnostic) => diagnostic.rule === rule);

interface RuleTestCase {
  fixture: string;
  ruleSource: string;
  severity?: "error" | "warning";
  category?: string;
}

const describeRules = (
  groupName: string,
  rules: Record<string, RuleTestCase>,
  getDiagnostics: () => Diagnostic[],
) => {
  describe(groupName, () => {
    for (const [ruleName, testCase] of Object.entries(rules)) {
      it(`${ruleName} (${testCase.fixture} → ${testCase.ruleSource})`, () => {
        const issues = findDiagnosticsByRule(getDiagnostics(), ruleName);
        expect(issues.length).toBeGreaterThan(0);
        if (testCase.severity) expect(issues[0].severity).toBe(testCase.severity);
        if (testCase.category) expect(issues[0].category).toBe(testCase.category);
      });
    }
  });
};

let basicReactDiagnostics: Diagnostic[];
let nextjsDiagnostics: Diagnostic[];

describe("runOxlint", () => {
  it("loads basic-react diagnostics", async () => {
    basicReactDiagnostics = await runOxlint(BASIC_REACT_DIRECTORY, true, "unknown");
    expect(basicReactDiagnostics.length).toBeGreaterThan(0);
  });

  it("loads nextjs diagnostics", async () => {
    nextjsDiagnostics = await runOxlint(NEXTJS_APP_DIRECTORY, true, "nextjs");
    expect(nextjsDiagnostics.length).toBeGreaterThan(0);
  });

  it("returns diagnostics with required fields", () => {
    for (const diagnostic of basicReactDiagnostics) {
      expect(diagnostic).toHaveProperty("filePath");
      expect(diagnostic).toHaveProperty("plugin");
      expect(diagnostic).toHaveProperty("rule");
      expect(diagnostic).toHaveProperty("severity");
      expect(diagnostic).toHaveProperty("message");
      expect(diagnostic).toHaveProperty("category");
      expect(["error", "warning"]).toContain(diagnostic.severity);
      expect(diagnostic.message.length).toBeGreaterThan(0);
    }
  });

  it("only reports diagnostics from JSX/TSX files", () => {
    for (const diagnostic of basicReactDiagnostics) {
      expect(diagnostic.filePath).toMatch(/\.(tsx|jsx)$/);
    }
  });

  describeRules(
    "function duration rules",
    {
      "async-parallel": {
        fixture: "js-performance-issues.tsx",
        ruleSource: "rules/js-performance.ts",
        category: "Function Duration",
      },
    },
    () => basicReactDiagnostics,
  );

  describeRules(
    "billing-focused nextjs rules",
    {
      "nextjs-no-img-element": {
        fixture: "app/page.tsx",
        ruleSource: "rules/nextjs.ts",
        category: "Image Optimization",
      },
      "nextjs-no-client-fetch-for-server-data": {
        fixture: "app/layout.tsx",
        ruleSource: "rules/nextjs.ts",
        category: "Invocations",
      },
      "nextjs-image-missing-sizes": {
        fixture: "app/page.tsx",
        ruleSource: "rules/nextjs.ts",
        category: "Image Optimization",
      },
      "nextjs-no-side-effect-in-get-handler": {
        fixture: "app/logout/route.tsx",
        ruleSource: "rules/nextjs.ts",
        severity: "error",
        category: "Caching",
      },
      "server-after-nonblocking": {
        fixture: "app/actions.tsx",
        ruleSource: "rules/server.ts",
        category: "Function Duration",
      },
    },
    () => nextjsDiagnostics,
  );
});
