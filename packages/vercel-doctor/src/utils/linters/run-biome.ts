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

interface BiomeDiagnostic {
  code?: { value?: string };
  message: string;
  severity: "ERROR" | "WARNING" | "INFO";
  location?: {
    path: string;
    range?: { start?: { line: number; column: number } };
  };
}

interface BiomeOutput {
  diagnostics: BiomeDiagnostic[];
}

const resolveBiomeBinary = (projectDirectory: string): string | null => {
  const localBinary = path.join(
    projectDirectory,
    "node_modules",
    ".bin",
    "biome",
  );
  if (fs.existsSync(localBinary)) {
    return localBinary;
  }

  return "biome";
};

const convertBiomeDiagnostics = (
  output: BiomeOutput,
  rootDirectory: string,
): Diagnostic[] => {
  const diagnostics: Diagnostic[] = [];

  for (const biomeDiagnostic of output.diagnostics ?? []) {
    if (biomeDiagnostic.severity === "INFO") {
      continue;
    }
    const reportedPath = biomeDiagnostic.location?.path ?? "";
    const filePath = path.isAbsolute(reportedPath)
      ? path.relative(rootDirectory, reportedPath)
      : reportedPath;
    const line = biomeDiagnostic.location?.range?.start?.line ?? 0;
    const column = biomeDiagnostic.location?.range?.start?.column ?? 0;

    diagnostics.push({
      category: RULE_CATEGORY_NAMES.OTHER,
      column,
      filePath,
      help: "",
      line,
      message: biomeDiagnostic.message,
      plugin: "biome",
      rule: biomeDiagnostic.code?.value ?? "parse-error",
      severity: biomeDiagnostic.severity === "ERROR" ? "error" : "warning",
    });
  }

  return diagnostics;
};

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

  const biomeBinary = resolveBiomeBinary(rootDirectory);
  if (!biomeBinary) {
    return [];
  }

  const args = ["lint", "--reporter=rdjson", "--", ...(includePaths ?? ["."])];

  const { promise, resolve, reject } = Promise.withResolvers<string>();
  const child = spawn(biomeBinary, args, {
    cwd: rootDirectory,
  });

  const stdoutBuffers: Buffer[] = [];
  const stderrBuffers: Buffer[] = [];

  child.stdout.on("data", (buffer: Buffer) => stdoutBuffers.push(buffer));
  child.stderr.on("data", (buffer: Buffer) => stderrBuffers.push(buffer));

  child.on("error", (error) =>
    reject(new Error(`Failed to run biome: ${error.message}`)),
  );
  child.on("close", (exitCode, signal) => {
    const output = Buffer.concat(stdoutBuffers).toString("utf8").trim();
    const stderrOutput = Buffer.concat(stderrBuffers).toString("utf8").trim();

    if (
      signal ||
      (exitCode !== 0 && exitCode !== 1) ||
      (exitCode !== 0 && !output) ||
      (!output && stderrOutput)
    ) {
      reject(
        new Error(
          `Failed to run biome: ${stderrOutput || signal || `exit code ${exitCode}`}`,
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

  let output: BiomeOutput;
  try {
    output = JSON.parse(stdout) as BiomeOutput;
  } catch {
    throw new Error(
      `Failed to parse biome output: ${stdout.slice(0, ERROR_PREVIEW_LENGTH_CHARS)}`,
    );
  }
  return convertBiomeDiagnostics(output, rootDirectory);
};

export const biomeRunner: LinterRunner = {
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
      return "@biomejs/biome" in allDeps;
    } catch {
      return false;
    }
  },
  kind: "biome",
  run,
};
