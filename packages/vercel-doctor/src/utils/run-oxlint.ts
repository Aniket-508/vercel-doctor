import { spawn } from "node:child_process";
import fs from "node:fs";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ERROR_PREVIEW_LENGTH_CHARS, JSX_FILE_PATTERN } from "../constants.js";
import { createOxlintConfig } from "../oxlint-config.js";
import type { CleanedDiagnostic, Diagnostic, Framework, OxlintOutput } from "../types.js";
import { neutralizeDisableDirectives } from "./neutralize-disable-directives.js";

const esmRequire = createRequire(import.meta.url);

const PLUGIN_CATEGORY_MAP: Record<string, string> = {};

const RULE_CATEGORY_MAP: Record<string, string> = {
  "vercel-doctor/nextjs-no-client-fetch-for-server-data": "Invocations",
  "vercel-doctor/nextjs-image-missing-sizes": "Image Optimization",
  "vercel-doctor/nextjs-link-prefetch-default": "Invocations",
  "vercel-doctor/nextjs-no-side-effect-in-get-handler": "Caching",

  "vercel-doctor/server-after-nonblocking": "Function Duration",

  "vercel-doctor/async-parallel": "Function Duration",
};

const RULE_HELP_MAP: Record<string, string> = {
  "nextjs-no-client-fetch-for-server-data":
    "Remove 'use client' and fetch directly in the Server Component — no API round-trip, secrets stay on server",
  "nextjs-link-prefetch-default":
    "Add prefetch={false} to Link, or disable globally in next.config. Add prefetch={true} only to critical links — reduces compute",
  "nextjs-image-missing-sizes":
    'Add sizes for responsive behavior: `sizes="(max-width: 768px) 100vw, 50vw"` matching your layout breakpoints',
  "nextjs-no-side-effect-in-get-handler":
    "Move the side effect to a POST handler and use a <form> or fetch with method POST — GET requests can be triggered by prefetching and are vulnerable to CSRF",

  "server-after-nonblocking":
    "`import { after } from 'next/server'` then wrap: `after(() => analytics.track(...))` — response isn't blocked",

  "async-parallel":
    "Use `const [a, b] = await Promise.all([fetchA(), fetchB()])` to run independent operations concurrently",
};

const FILEPATH_WITH_LOCATION_PATTERN = /\S+\.\w+:\d+:\d+[\s\S]*$/;

const cleanDiagnosticMessage = (message: string, help: string, rule: string): CleanedDiagnostic => {
  const cleaned = message.replace(FILEPATH_WITH_LOCATION_PATTERN, "").trim();
  return { message: cleaned || message, help: help || RULE_HELP_MAP[rule] || "" };
};

const parseRuleCode = (code: string): { plugin: string; rule: string } => {
  const match = code.match(/^(.+)\((.+)\)$/);
  if (!match) return { plugin: "unknown", rule: code };
  return { plugin: match[1].replace(/^eslint-plugin-/, ""), rule: match[2] };
};

const resolveOxlintBinary = (): string => {
  const oxlintMainPath = esmRequire.resolve("oxlint");
  const oxlintPackageDirectory = path.resolve(path.dirname(oxlintMainPath), "..");
  return path.join(oxlintPackageDirectory, "bin", "oxlint");
};

const resolvePluginPath = (): string => {
  const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
  const pluginPath = path.join(currentDirectory, "vercel-doctor-plugin.js");
  if (fs.existsSync(pluginPath)) return pluginPath;

  const distPluginPath = path.resolve(currentDirectory, "../../dist/vercel-doctor-plugin.js");
  if (fs.existsSync(distPluginPath)) return distPluginPath;

  return pluginPath;
};

const resolveDiagnosticCategory = (plugin: string, rule: string): string => {
  const ruleKey = `${plugin}/${rule}`;
  return RULE_CATEGORY_MAP[ruleKey] ?? PLUGIN_CATEGORY_MAP[plugin] ?? "Other";
};

export const runOxlint = async (
  rootDirectory: string,
  hasTypeScript: boolean,
  framework: Framework,
  includePaths?: string[],
): Promise<Diagnostic[]> => {
  if (includePaths !== undefined && includePaths.length === 0) {
    return [];
  }

  const configPath = path.join(os.tmpdir(), `vercel-doctor-oxlintrc-${process.pid}.json`);
  const pluginPath = resolvePluginPath();
  const config = createOxlintConfig({ pluginPath, framework });
  const restoreDisableDirectives = neutralizeDisableDirectives(rootDirectory);

  try {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

    const oxlintBinary = resolveOxlintBinary();
    const args = [oxlintBinary, "-c", configPath, "--format", "json"];

    if (hasTypeScript) {
      args.push("--tsconfig", "./tsconfig.json");
    }

    if (includePaths !== undefined) {
      args.push(...includePaths);
    } else {
      args.push(".");
    }

    const stdout = await new Promise<string>((resolve, reject) => {
      const child = spawn(process.execPath, args, {
        cwd: rootDirectory,
      });

      const stdoutBuffers: Buffer[] = [];
      const stderrBuffers: Buffer[] = [];

      child.stdout.on("data", (buffer: Buffer) => stdoutBuffers.push(buffer));
      child.stderr.on("data", (buffer: Buffer) => stderrBuffers.push(buffer));

      child.on("error", (error) => reject(new Error(`Failed to run oxlint: ${error.message}`)));
      child.on("close", () => {
        const output = Buffer.concat(stdoutBuffers).toString("utf-8").trim();
        if (!output) {
          const stderrOutput = Buffer.concat(stderrBuffers).toString("utf-8").trim();
          if (stderrOutput) {
            reject(new Error(`Failed to run oxlint: ${stderrOutput}`));
            return;
          }
        }
        resolve(output);
      });
    });

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
      .filter((diagnostic) => diagnostic.code && JSX_FILE_PATTERN.test(diagnostic.filename))
      .map((diagnostic) => {
        const { plugin, rule } = parseRuleCode(diagnostic.code);
        const primaryLabel = diagnostic.labels[0];

        const cleaned = cleanDiagnosticMessage(diagnostic.message, diagnostic.help, rule);

        return {
          filePath: diagnostic.filename,
          plugin,
          rule,
          severity: diagnostic.severity,
          message: cleaned.message,
          help: cleaned.help,
          line: primaryLabel?.span.line ?? 0,
          column: primaryLabel?.span.column ?? 0,
          category: resolveDiagnosticCategory(plugin, rule),
        };
      });
  } finally {
    restoreDisableDirectives();
    if (fs.existsSync(configPath)) {
      fs.unlinkSync(configPath);
    }
  }
};
