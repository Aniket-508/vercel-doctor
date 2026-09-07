import { spawn } from "node:child_process";
import fs from "node:fs";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  ERROR_PREVIEW_LENGTH_CHARS,
  SOURCE_FILE_PATTERN,
} from "../constants.js";
import { createOxlintConfig } from "../oxlint-config.js";
import {
  RULE_CATEGORY_NAMES,
  QUALIFIED_PLUGIN_RULE_METADATA,
} from "../rule-metadata.js";
import type {
  CleanedDiagnostic,
  Diagnostic,
  Framework,
  OxlintOutput,
} from "../types.js";

const esmRequire = createRequire(import.meta.url);

const FILEPATH_WITH_LOCATION_PATTERN = /\S+\.\w+:\d+:\d+[\s\S]*$/;

const getRuleDetails = (plugin: string, rule: string) =>
  QUALIFIED_PLUGIN_RULE_METADATA[`${plugin}/${rule}`];

const cleanDiagnosticMessage = (
  message: string,
  help: string,
  plugin: string,
  rule: string,
): CleanedDiagnostic => {
  const cleaned = message.replace(FILEPATH_WITH_LOCATION_PATTERN, "").trim();
  return {
    help: help || getRuleDetails(plugin, rule)?.help || "",
    message: cleaned || message,
  };
};

const parseRuleCode = (code: string): { plugin: string; rule: string } => {
  const match = code.match(/^(.+)\((.+)\)$/);
  if (!match) {
    return { plugin: "unknown", rule: code };
  }
  return { plugin: match[1].replace(/^eslint-plugin-/, ""), rule: match[2] };
};

const resolveOxlintBinary = (): string => {
  const oxlintMainPath = esmRequire.resolve("oxlint");
  const oxlintPackageDirectory = path.resolve(
    path.dirname(oxlintMainPath),
    "..",
  );
  return path.join(oxlintPackageDirectory, "bin", "oxlint");
};

const resolvePluginPath = (): string => {
  const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
  const pluginPath = path.join(currentDirectory, "vercel-doctor-plugin.js");
  if (fs.existsSync(pluginPath)) {
    return pluginPath;
  }

  const distPluginPath = path.resolve(
    currentDirectory,
    "../../dist/vercel-doctor-plugin.js",
  );
  if (fs.existsSync(distPluginPath)) {
    return distPluginPath;
  }

  return pluginPath;
};

const resolveDiagnosticCategory = (plugin: string, rule: string): string =>
  getRuleDetails(plugin, rule)?.category ?? RULE_CATEGORY_NAMES.OTHER;

export const runOxlint = async (
  rootDirectory: string,
  hasTypeScript: boolean,
  framework: Framework,
  includePaths?: string[],
): Promise<Diagnostic[]> => {
  if (includePaths !== undefined && includePaths.length === 0) {
    return [];
  }

  const configDirectory = fs.mkdtempSync(
    path.join(os.tmpdir(), "vercel-doctor-oxlint-"),
  );
  const configPath = path.join(configDirectory, "oxlintrc.json");
  try {
    const pluginPath = resolvePluginPath();
    const config = createOxlintConfig({ framework, pluginPath });
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

    const oxlintBinary = resolveOxlintBinary();
    const args = [oxlintBinary, "-c", configPath, "--format", "json"];

    if (hasTypeScript) {
      args.push("--tsconfig", "./tsconfig.json");
    }

    args.push("--");
    if (includePaths === undefined) {
      args.push(".");
    } else {
      args.push(...includePaths);
    }

    const { promise, resolve, reject } = Promise.withResolvers<string>();
    const child = spawn(process.execPath, args, {
      cwd: rootDirectory,
    });

    const stdoutBuffers: Buffer[] = [];
    const stderrBuffers: Buffer[] = [];

    child.stdout.on("data", (buffer: Buffer) => stdoutBuffers.push(buffer));
    child.stderr.on("data", (buffer: Buffer) => stderrBuffers.push(buffer));

    child.on("error", (error) =>
      reject(new Error(`Failed to run oxlint: ${error.message}`)),
    );
    child.on("close", (exitCode, signal) => {
      const output = Buffer.concat(stdoutBuffers).toString("utf8").trim();
      if (
        signal ||
        (exitCode !== 0 && exitCode !== 1) ||
        (exitCode !== 0 && !output)
      ) {
        const stderrOutput = Buffer.concat(stderrBuffers)
          .toString("utf8")
          .trim();
        reject(
          new Error(
            `Failed to run oxlint: ${stderrOutput || signal || `exit code ${exitCode}`}`,
          ),
        );
        return;
      }
      if (!output) {
        const stderrOutput = Buffer.concat(stderrBuffers)
          .toString("utf8")
          .trim();
        if (stderrOutput) {
          reject(new Error(`Failed to run oxlint: ${stderrOutput}`));
          return;
        }
      }
      resolve(output);
    });

    const stdout = await promise;

    if (!stdout) {
      return [];
    }

    let output: OxlintOutput;
    try {
      output = JSON.parse(stdout) as OxlintOutput;
    } catch {
      throw new Error(
        `Failed to parse oxlint output: ${stdout.slice(0, ERROR_PREVIEW_LENGTH_CHARS)}`,
      );
    }

    return output.diagnostics
      .filter(
        (diagnostic) =>
          diagnostic.code && SOURCE_FILE_PATTERN.test(diagnostic.filename),
      )
      .map((diagnostic) => {
        const { plugin, rule } = parseRuleCode(diagnostic.code);
        const [primaryLabel] = diagnostic.labels;

        const cleaned = cleanDiagnosticMessage(
          diagnostic.message,
          diagnostic.help,
          plugin,
          rule,
        );

        return {
          category: resolveDiagnosticCategory(plugin, rule),
          column: primaryLabel?.span.column ?? 0,
          filePath: diagnostic.filename,
          help: cleaned.help,
          line: primaryLabel?.span.line ?? 0,
          message: cleaned.message,
          plugin,
          rule,
          severity: diagnostic.severity,
        };
      });
  } finally {
    fs.rmSync(configDirectory, { force: true, recursive: true });
  }
};
