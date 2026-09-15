import { spawn } from "node:child_process";
import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

import type {
  Diagnostic,
  LinterRunner,
  LinterRunOptions,
  ProjectInfo,
} from "../../types.js";
import { parseRslintOutput } from "../parse-rslint-output.js";
import { readPackageJson } from "../read-package-json.js";

const run = async (
  rootDirectory: string,
  _projectInfo: ProjectInfo,
  options: LinterRunOptions,
): Promise<Diagnostic[]> => {
  const { includePaths } = options;
  if (includePaths !== undefined && includePaths.length === 0) {
    return [];
  }

  const args = [
    "--format",
    "jsonline",
    "--no-color",
    "--",
    ...(includePaths ?? ["."]),
  ];
  let command = "rslint";
  try {
    const projectRequire = createRequire(
      path.join(path.resolve(rootDirectory), "package.json"),
    );
    args.unshift(projectRequire.resolve("@rslint/core/bin"));
    command = process.execPath;
  } catch {
    const localBinary = path.join(
      path.resolve(rootDirectory),
      "node_modules",
      ".bin",
      "rslint",
    );
    if (fs.existsSync(localBinary)) {
      command = localBinary;
    }
  }

  const { promise, resolve, reject } = Promise.withResolvers<string>();
  const child = spawn(command, args, { cwd: rootDirectory });
  const stdoutBuffers: Buffer[] = [];
  const stderrBuffers: Buffer[] = [];
  child.stdout.on("data", (buffer: Buffer) => stdoutBuffers.push(buffer));
  child.stderr.on("data", (buffer: Buffer) => stderrBuffers.push(buffer));
  child.on("error", (error) =>
    reject(new Error(`Failed to run rslint: ${error.message}`)),
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
          `Failed to run rslint: ${stderrOutput || signal || `exit code ${exitCode}`}`,
        ),
      );
      return;
    }
    resolve(output);
  });

  return parseRslintOutput(await promise, rootDirectory);
};

export const rslintRunner: LinterRunner = {
  detect: (projectDirectory: string) => {
    const packageJsonPath = path.join(projectDirectory, "package.json");
    if (!fs.existsSync(packageJsonPath)) {
      return false;
    }
    try {
      const packageJson = readPackageJson(packageJsonPath);
      const dependencies = {
        ...packageJson.peerDependencies,
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
      };
      return "@rslint/core" in dependencies;
    } catch {
      return false;
    }
  },
  kind: "rslint",
  run,
};
