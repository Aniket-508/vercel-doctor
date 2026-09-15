import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { detectLinter } from "../src/utils/linters/detect-linter.js";
import { parseRslintOutput } from "../src/utils/parse-rslint-output.js";

let projectDirectory: string;

describe("rslint integration", () => {
  beforeEach(() => {
    projectDirectory = fs.mkdtempSync(
      path.join(os.tmpdir(), "vercel-doctor-rslint-test-"),
    );
  });

  afterEach(() => {
    fs.rmSync(projectDirectory, { force: true, recursive: true });
  });

  it("prefers Oxlint, Biome, Rslint, then ESLint when linters coexist", () => {
    fs.writeFileSync(
      path.join(projectDirectory, "package.json"),
      JSON.stringify({
        devDependencies: { "@rslint/core": "0.9.2", eslint: "9.0.0" },
      }),
    );
    expect(detectLinter(projectDirectory)).toBe("rslint");
    fs.writeFileSync(path.join(projectDirectory, "biome.json"), "{}");
    expect(detectLinter(projectDirectory)).toBe("biome");
    fs.writeFileSync(path.join(projectDirectory, ".oxlintrc.json"), "{}");
    expect(detectLinter(projectDirectory)).toBe("oxlint");
  });

  it("recognizes discoverable Rslint config without a package-local dependency", () => {
    fs.writeFileSync(
      path.join(projectDirectory, "rslint.config.mts"),
      "export default [];\n",
    );
    expect(detectLinter(projectDirectory)).toBe("rslint");
  });

  it("decodes JSON Lines while preserving rule identifiers, severities and source locations", () => {
    const output = [
      JSON.stringify({
        filePath: path.join(projectDirectory, "source.ts"),
        message: "Unexpected 'debugger' statement.",
        range: { start: { column: 1, line: 2 } },
        ruleName: "no-debugger",
        severity: "error",
      }),
      "",
      JSON.stringify({
        filePath: "source.ts",
        message: "Unexpected console statement.",
        range: { start: { column: 1, line: 3 } },
        ruleName: "no-console",
        severity: "warn",
      }),
    ].join("\r\n");
    expect(parseRslintOutput(output, projectDirectory)).toStrictEqual([
      expect.objectContaining({
        column: 1,
        filePath: "source.ts",
        line: 2,
        plugin: "rslint",
        rule: "no-debugger",
        severity: "error",
      }),
      expect.objectContaining({
        column: 1,
        filePath: "source.ts",
        line: 3,
        plugin: "rslint",
        rule: "no-console",
        severity: "warning",
      }),
    ]);
  });

  it("rejects malformed diagnostic records rather than reporting a clean scan", () => {
    expect(() =>
      parseRslintOutput('{"message":"bad configuration"}\n', projectDirectory),
    ).toThrow(Error);
    expect(() => parseRslintOutput("not json\n", projectDirectory)).toThrow(
      Error,
    );
  });
});
