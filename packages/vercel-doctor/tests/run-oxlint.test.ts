import path from "node:path";

import { describe, expect, it } from "vitest";

import type { Diagnostic } from "../src/types.js";
import { runOxlint } from "../src/utils/run-oxlint.js";

const FIXTURES_DIRECTORY = path.resolve(import.meta.dirname, "fixtures");
const BASIC_REACT_DIRECTORY = path.join(FIXTURES_DIRECTORY, "basic-react");
const NEXTJS_APP_DIRECTORY = path.join(FIXTURES_DIRECTORY, "nextjs-app");

const findDiagnosticsByRule = (
  diagnostics: Diagnostic[],
  rule: string,
): Diagnostic[] => diagnostics.filter((diagnostic) => diagnostic.rule === rule);

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
  const rows = (Object.entries(rules) as [string, RuleTestCase][]).map(
    ([ruleName, testCase]) =>
      [ruleName, testCase.fixture, testCase.ruleSource, ruleName, testCase] as [
        string,
        string,
        string,
        string,
        RuleTestCase,
      ],
  );
  describe(groupName, () => {
    it.each(rows)(
      "%s (%s → %s)",
      (_displayName, _fixture, _ruleSource, ruleName, testCase) => {
        const issues = findDiagnosticsByRule(getDiagnostics(), ruleName);
        expect(issues.length).toBeGreaterThan(0);
        expect(issues[0].severity).toBe(
          testCase.severity ?? issues[0].severity,
        );
        expect(issues[0].category).toBe(
          testCase.category ?? issues[0].category,
        );
      },
    );
  });
};

let basicReactDiagnostics: Diagnostic[];
let nextjsDiagnostics: Diagnostic[];

describe(runOxlint, () => {
  it("loads basic-react diagnostics", async () => {
    basicReactDiagnostics = await runOxlint(
      BASIC_REACT_DIRECTORY,
      true,
      "unknown",
    );
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

  describeRules(
    "function duration rules",
    {
      "async-parallel": {
        category: "Function Duration",
        fixture: "js-performance-issues.tsx",
        ruleSource: "rules/js-performance.ts",
      },
    },
    () => basicReactDiagnostics,
  );

  it("does not report nextjs-link-prefetch-default when Link has prefetch={false}", () => {
    const linkPrefetchDisabledIssues = findDiagnosticsByRule(
      nextjsDiagnostics,
      "nextjs-link-prefetch-default",
    ).filter((innerDiagnostic) => innerDiagnostic.filePath.includes("nav-ok"));
    expect(linkPrefetchDisabledIssues).toHaveLength(0);
  });

  describeRules(
    "billing-focused nextjs rules",
    {
      "nextjs-image-missing-sizes": {
        category: "Image Optimization",
        fixture: "app/page.tsx",
        ruleSource: "rules/nextjs.ts",
      },
      "nextjs-link-prefetch-default": {
        category: "Invocations",
        fixture: "app/nav.tsx",
        ruleSource: "rules/nextjs.ts",
      },
      "nextjs-no-client-fetch-for-server-data": {
        category: "Invocations",
        fixture: "app/layout.tsx",
        ruleSource: "rules/nextjs.ts",
      },
      "nextjs-no-side-effect-in-get-handler": {
        category: "Caching",
        fixture: "app/logout/route.tsx",
        ruleSource: "rules/nextjs.ts",
        severity: "error",
      },
      "server-after-nonblocking": {
        category: "Function Duration",
        fixture: "app/actions.tsx",
        ruleSource: "rules/server.ts",
      },
    },
    () => nextjsDiagnostics,
  );
});
