import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

import { ERROR_PREVIEW_LENGTH_CHARS } from "../../constants.js";
import { RULE_CATEGORY_NAMES } from "../../rule-metadata.js";
import type {
  Diagnostic,
  Framework,
  LinterRunner,
  ProjectInfo,
} from "../../types.js";

interface EslintMessage {
  ruleId: string | null;
  severity: number;
  message: string;
  line: number;
  column: number;
}

interface EslintFileResult {
  filePath: string;
  messages: EslintMessage[];
}

type EslintOutput = EslintFileResult[];

const resolveEslintBinary = (projectDirectory: string): string | null => {
  const localBinary = path.join(
    projectDirectory,
    "node_modules",
    ".bin",
    "eslint",
  );
  if (fs.existsSync(localBinary)) {
    return localBinary;
  }

  return "eslint";
};

const resolveSeverity = (severity: number): "error" | "warning" =>
  severity === 2 ? "error" : "warning";

const run = async (
  rootDirectory: string,
  projectInfo: ProjectInfo,
  options: {
    hasTypeScript: boolean;
    framework: Framework;
    includePaths?: string[];
  },
): Promise<Diagnostic[]> => {
  const { includePaths } = options;

  if (includePaths !== undefined && includePaths.length === 0) {
    return [];
  }

  const eslintBinary = resolveEslintBinary(rootDirectory);
  if (!eslintBinary) {
    return [];
  }

  const args = [
    "--format",
    "json",
    "--no-error-on-unmatched-pattern",
    "--",
    ...(includePaths ?? ["."]),
  ];

  const { promise, resolve, reject } = Promise.withResolvers<string>();
  const child = spawn(eslintBinary, args, {
    cwd: rootDirectory,
  });

  const stdoutBuffers: Buffer[] = [];
  const stderrBuffers: Buffer[] = [];

  child.stdout.on("data", (buffer: Buffer) => stdoutBuffers.push(buffer));
  child.stderr.on("data", (buffer: Buffer) => stderrBuffers.push(buffer));

  child.on("error", (error) =>
    reject(new Error(`Failed to run eslint: ${error.message}`)),
  );
  child.on("close", (exitCode, signal) => {
    const output = Buffer.concat(stdoutBuffers).toString("utf8").trim();
    const stderrOutput = Buffer.concat(stderrBuffers).toString("utf8").trim();

    if (
      signal ||
      (exitCode !== 0 && exitCode !== 1) ||
      (exitCode !== 0 && !output)
    ) {
      reject(
        new Error(
          `Failed to run eslint: ${stderrOutput || signal || `exit code ${exitCode}`}`,
        ),
      );
      return;
    }

    resolve(output);
  });

  const stdout = await promise;

  if (!stdout) {
    return [];
  }

  let output: EslintOutput;
  try {
    output = JSON.parse(stdout) as EslintOutput;
  } catch {
    throw new Error(
      `Failed to parse eslint output: ${stdout.slice(0, ERROR_PREVIEW_LENGTH_CHARS)}`,
    );
  }

  const diagnostics: Diagnostic[] = [];

  for (const fileResult of output) {
    for (const message of fileResult.messages) {
      if (message.severity === 0) {
        continue;
      }

      diagnostics.push({
        category: RULE_CATEGORY_NAMES.OTHER,
        column: message.column,
        filePath: path.relative(rootDirectory, fileResult.filePath),
        help: "",
        line: message.line,
        message: message.message,
        plugin: "eslint",
        rule: message.ruleId ?? "parse-error",
        severity: resolveSeverity(message.severity),
      });
    }
  }

  return diagnostics;
};

export const eslintRunner: LinterRunner = {
  detect: (projectDirectory: string) => {
    const packageJsonPath = path.join(projectDirectory, "package.json");
    if (!fs.existsSync(packageJsonPath)) {
      return false;
    }
    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
      const allDeps = {
        ...packageJson.peerDependencies,
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
      };
      return "eslint" in allDeps;
    } catch {
      return false;
    }
  },
  kind: "eslint",
  run,
};
