import { ChildProcess, spawn } from "node:child_process";
import type { ChildProcessWithoutNullStreams } from "node:child_process";
import type * as ChildProcessModule from "node:child_process";
import path from "node:path";
import { PassThrough } from "node:stream";

import { beforeEach, describe, expect, it, vi } from "vitest";

import type { ProjectInfo } from "../src/types.js";
import { biomeRunner } from "../src/utils/linters/run-biome.js";
import { eslintRunner } from "../src/utils/linters/run-eslint.js";
import { oxlintRunner } from "../src/utils/linters/run-oxlint.js";
import { rslintRunner } from "../src/utils/linters/run-rslint.js";

vi.mock("node:child_process", async (importOriginal) => ({
  ...(await importOriginal<typeof ChildProcessModule>()),
  spawn: vi.fn(),
}));

const rootDirectory = path.resolve("/project");
const projectInfo: ProjectInfo = {
  framework: "unknown",
  hasTypeScript: false,
  nextMajorVersion: null,
  nextVersion: null,
  projectName: "project",
  reactVersion: null,
  rootDirectory,
  sourceFileCount: 0,
  svelteVersion: null,
  vueVersion: null,
};
const options = { framework: projectInfo.framework, hasTypeScript: false };

const mockProcessOutput = (
  output: unknown,
  exitCode: number | null,
  signal: string | null = null,
) => {
  vi.mocked(spawn).mockImplementation(() => {
    const child = Object.assign(new ChildProcess(), {
      stderr: new PassThrough(),
      stdout: new PassThrough(),
    });
    queueMicrotask(() => {
      if (output !== undefined) {
        child.stdout.write(JSON.stringify(output));
      }
      child.emit("close", exitCode, signal);
    });
    return child as ChildProcessWithoutNullStreams;
  });
};

describe("linter runners", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe.each([eslintRunner, biomeRunner, oxlintRunner, rslintRunner])(
    "$kind process handling",
    (runner) => {
      it("rejects signal termination instead of returning a clean scan", async () => {
        mockProcessOutput(undefined, null, "SIGTERM");
        await expect(
          runner.run(rootDirectory, projectInfo, options),
        ).rejects.toThrow(/SIGTERM/);
      });

      it("rejects silent tool failure instead of returning a clean scan", async () => {
        mockProcessOutput(undefined, 2);
        await expect(
          runner.run(rootDirectory, projectInfo, options),
        ).rejects.toThrow(/exit code 2/);
      });

      it("keeps explicit empty scopes empty", async () => {
        await expect(
          runner.run(rootDirectory, projectInfo, {
            ...options,
            includePaths: [],
          }),
        ).resolves.toStrictEqual([]);
        expect(spawn).not.toHaveBeenCalled();
      });
    },
  );

  it("retains ESLint parser errors and reports project-relative paths", async () => {
    mockProcessOutput(
      [
        {
          filePath: path.join(rootDirectory, "src/broken.ts"),
          messages: [
            {
              column: 7,
              line: 3,
              message: "Unexpected token",
              ruleId: null,
              severity: 2,
            },
          ],
        },
      ],
      1,
    );
    await expect(
      eslintRunner.run(rootDirectory, projectInfo, options),
    ).resolves.toStrictEqual([
      expect.objectContaining({
        column: 7,
        filePath: "src/broken.ts",
        line: 3,
        message: "Unexpected token",
        rule: "parse-error",
        severity: "error",
      }),
    ]);
  });

  it("decodes Biome Reviewdog diagnostics with accurate locations and severities", async () => {
    mockProcessOutput(
      {
        diagnostics: [
          {
            code: { value: "lint/suspicious/noDebugger" },
            location: {
              path: "src/index.ts",
              range: { start: { column: 1, line: 6 } },
            },
            message: "This is an unexpected use of the debugger statement.",
            severity: "ERROR",
          },
          {
            code: { value: "lint/correctness/noUnusedImports" },
            location: {
              path: path.join(rootDirectory, "src/index.ts"),
              range: { start: { column: 8, line: 1 } },
            },
            message: "This import is unused.",
            severity: "WARNING",
          },
        ],
      },
      1,
    );
    await expect(
      biomeRunner.run(rootDirectory, projectInfo, options),
    ).resolves.toStrictEqual([
      expect.objectContaining({
        column: 1,
        filePath: "src/index.ts",
        line: 6,
        rule: "lint/suspicious/noDebugger",
        severity: "error",
      }),
      expect.objectContaining({
        column: 8,
        filePath: "src/index.ts",
        line: 1,
        rule: "lint/correctness/noUnusedImports",
        severity: "warning",
      }),
    ]);
  });
});
