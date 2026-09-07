import fs from "node:fs";
import path from "node:path";

import { main } from "knip";
import { createOptions } from "knip/session";

import { RULE_CATEGORY_NAMES } from "../rule-metadata.js";
import type { Diagnostic, KnipIssueRecords, KnipResults } from "../types.js";

/* eslint-disable arrow-body-style, no-useless-return -- noop for silencing console */
const noop = (): void => {
  return;
};
/* eslint-enable arrow-body-style, no-useless-return */

const KNIP_DEFAULT_CATEGORY = RULE_CATEGORY_NAMES.DEAD_CODE;

const KNIP_DEFAULT_SEVERITY: Diagnostic["severity"] = "warning";

const KNIP_ISSUE_DETAILS: Record<
  string,
  {
    category: string;
    message: string;
    severity: Diagnostic["severity"];
    help: string;
  }
> = {
  duplicates: {
    category: KNIP_DEFAULT_CATEGORY,
    help: "",
    message: "Duplicate export",
    severity: KNIP_DEFAULT_SEVERITY,
  },
  exports: {
    category: KNIP_DEFAULT_CATEGORY,
    help: "",
    message: "Unused export",
    severity: KNIP_DEFAULT_SEVERITY,
  },
  files: {
    category: KNIP_DEFAULT_CATEGORY,
    help: "This file is not imported by any other file in the project.",
    message: "Unused file",
    severity: KNIP_DEFAULT_SEVERITY,
  },
  types: {
    category: KNIP_DEFAULT_CATEGORY,
    help: "",
    message: "Unused type",
    severity: KNIP_DEFAULT_SEVERITY,
  },
};

const createKnipDiagnostic = (
  rootDirectory: string,
  issueType: string,
  filePath: string,
  symbol?: string,
): Diagnostic => {
  const issueDetails = KNIP_ISSUE_DETAILS[issueType] ?? {
    category: KNIP_DEFAULT_CATEGORY,
    help: "",
    message: "Unused code",
    severity: KNIP_DEFAULT_SEVERITY,
  };

  return {
    category: issueDetails.category,
    column: 0,
    filePath: path.relative(rootDirectory, filePath),
    help: issueDetails.help,
    line: 0,
    message: symbol
      ? `${issueDetails.message}: ${symbol}`
      : issueDetails.message,
    plugin: "knip",
    rule: issueType,
    severity: issueDetails.severity,
    weight: 1,
  };
};

const collectIssueRecords = (
  records: KnipIssueRecords,
  issueType: string,
  rootDirectory: string,
): Diagnostic[] => {
  const diagnostics: Diagnostic[] = [];

  for (const issues of Object.values(records)) {
    for (const issue of Object.values(issues)) {
      diagnostics.push(
        createKnipDiagnostic(
          rootDirectory,
          issueType,
          issue.filePath,
          issue.symbol,
        ),
      );
    }
  }

  return diagnostics;
};

// HACK: knip triggers dotenv which logs to stdout/stderr via console methods
const silenced = async <T>(fn: () => Promise<T>): Promise<T> => {
  const originalLog = console.log;
  const originalInfo = console.info;
  const originalWarn = console.warn;
  const originalError = console.error;
  console.log = noop;
  console.info = noop;
  console.warn = noop;
  console.error = noop;
  try {
    return await fn();
  } finally {
    console.log = originalLog;
    console.info = originalInfo;
    console.warn = originalWarn;
    console.error = originalError;
  }
};

const findMonorepoRoot = (directory: string): string | null => {
  let currentDirectory = path.dirname(directory);

  while (currentDirectory !== path.dirname(currentDirectory)) {
    const hasWorkspaceConfig =
      fs.existsSync(path.join(currentDirectory, "pnpm-workspace.yaml")) ||
      (() => {
        const packageJsonPath = path.join(currentDirectory, "package.json");
        if (!fs.existsSync(packageJsonPath)) {
          return false;
        }
        const packageJson = JSON.parse(
          fs.readFileSync(packageJsonPath, "utf8"),
        );
        return (
          Array.isArray(packageJson.workspaces) ||
          packageJson.workspaces?.packages
        );
      })();

    if (hasWorkspaceConfig) {
      return currentDirectory;
    }
    currentDirectory = path.dirname(currentDirectory);
  }

  return null;
};

const CONFIG_LOADING_ERROR_PATTERN = /Error loading .*\/([a-z-]+)\.config\./;

const extractFailedPluginName = (error: unknown): string | null => {
  const match = String(error).match(CONFIG_LOADING_ERROR_PATTERN);
  return match?.[1] ?? null;
};

const MAX_KNIP_RETRIES = 5;

const runKnipWithOptions = async (
  knipCwd: string,
  workspaceName?: string,
): Promise<KnipResults> => {
  const options = await silenced(() =>
    createOptions({
      cwd: knipCwd,
      isShowProgress: false,
      ...(workspaceName ? { workspace: workspaceName } : {}),
    }),
  );

  const parsedConfig = options.parsedConfig as Record<string, unknown>;

  for (let attempt = 0; attempt <= MAX_KNIP_RETRIES; attempt += 1) {
    try {
      return (await silenced(() => main(options))) as KnipResults;
    } catch (error) {
      const failedPlugin = extractFailedPluginName(error);
      if (!failedPlugin || attempt === MAX_KNIP_RETRIES) {
        throw error;
      }
      parsedConfig[failedPlugin] = false;
    }
  }

  throw new Error("Unreachable");
};

const hasNodeModules = (directory: string): boolean => {
  const nodeModulesPath = path.join(directory, "node_modules");
  return (
    fs.existsSync(nodeModulesPath) && fs.statSync(nodeModulesPath).isDirectory()
  );
};

export const runKnip = async (rootDirectory: string): Promise<Diagnostic[]> => {
  const monorepoRoot = findMonorepoRoot(rootDirectory);
  const hasInstalledDependencies =
    hasNodeModules(rootDirectory) ||
    (monorepoRoot !== null && hasNodeModules(monorepoRoot));

  if (!hasInstalledDependencies) {
    return [];
  }

  let knipResult: KnipResults;

  if (monorepoRoot) {
    const workspaceName = path
      .relative(monorepoRoot, rootDirectory)
      .split(path.sep)
      .join("/");

    try {
      knipResult = await runKnipWithOptions(monorepoRoot, workspaceName);
    } catch {
      knipResult = await runKnipWithOptions(rootDirectory);
    }
  } else {
    knipResult = await runKnipWithOptions(rootDirectory);
  }

  const { issues } = knipResult;
  const diagnostics: Diagnostic[] = [];

  for (const unusedFile of issues.files) {
    diagnostics.push(createKnipDiagnostic(rootDirectory, "files", unusedFile));
  }

  const recordTypes = ["exports", "types", "duplicates"] as const;

  for (const issueType of recordTypes) {
    diagnostics.push(
      ...collectIssueRecords(issues[issueType], issueType, rootDirectory),
    );
  }

  return diagnostics.filter((diagnostic) => {
    const relativePath = diagnostic.filePath;
    return (
      !path.isAbsolute(relativePath) &&
      relativePath !== ".." &&
      !relativePath.startsWith(`..${path.sep}`)
    );
  });
};
