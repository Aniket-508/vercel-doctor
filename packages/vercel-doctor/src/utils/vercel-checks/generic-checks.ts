import fs from "node:fs";
import path from "node:path";

import {
  BYTES_PER_KILOBYTE,
  FLUID_COMPUTE_ROUTE_THRESHOLD_COUNT,
  LARGE_PROJECT_FILE_COUNT_THRESHOLD,
  MAX_STATIC_ASSET_CDN_DIAGNOSTICS_COUNT,
  STATIC_ASSET_CDN_WARNING_THRESHOLD_BYTES,
  STATIC_ASSET_SIZE_DECIMAL_PLACES_COUNT,
} from "../../constants.js";
import { OXLINT_PLUGIN_NAME, VERCEL_RULE_IDS } from "../../rule-ids.js";
import { RULE_CATEGORY_NAMES } from "../../rule-metadata.js";
import type {
  Diagnostic,
  StaticAssetCandidate,
  VercelConfig,
  VercelConfigCron,
  VercelConfigFunctionConfig,
} from "../../types.js";
import { readPackageJson } from "../read-package-json.js";

const VERCEL_JSON_PATH = "vercel.json";
const PACKAGE_JSON_PATH = "package.json";
const BUN_LOCK_PATH = "bun.lock";
const BUN_LOCK_BINARY_PATH = "bun.lockb";

export const normalizeProjectPath = (filePath: string): string =>
  filePath.replaceAll("\\", "/").replace(/^\.\//, "");

export const isObjectRecord = (
  value: unknown,
): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export const buildIncludedPathSet = (
  rootDirectory: string,
  includePaths?: string[],
): Set<string> | null => {
  if (includePaths === undefined) {
    return null;
  }

  const includedPathSet = new Set<string>();
  for (const includePath of includePaths) {
    const relativeIncludePath = path.isAbsolute(includePath)
      ? path.relative(rootDirectory, includePath)
      : includePath;
    includedPathSet.add(normalizeProjectPath(relativeIncludePath));
  }
  return includedPathSet;
};

export const shouldInspectPath = (
  relativeFilePath: string,
  includedPathSet: Set<string> | null,
): boolean =>
  includedPathSet === null ||
  includedPathSet.has(normalizeProjectPath(relativeFilePath));

const IGNORED_DIRECTORY_NAMES = new Set([
  ".git",
  ".next",
  ".nuxt",
  ".output",
  ".svelte-kit",
  ".turbo",
  ".vercel",
  "node_modules",
  "dist",
  "build",
  "coverage",
]);

export const collectProjectFilePaths = (rootDirectory: string): string[] => {
  const discoveredFilePaths: string[] = [];
  const directoryQueue = [rootDirectory];

  while (directoryQueue.length > 0) {
    const currentDirectory = directoryQueue.pop();
    if (!currentDirectory) {
      continue;
    }

    let directoryEntries: fs.Dirent[] = [];
    try {
      directoryEntries = fs.readdirSync(currentDirectory, {
        withFileTypes: true,
      });
    } catch {
      continue;
    }

    for (const directoryEntry of directoryEntries) {
      const entryAbsolutePath = path.join(
        currentDirectory,
        directoryEntry.name,
      );
      const entryRelativePath = normalizeProjectPath(
        path.relative(rootDirectory, entryAbsolutePath),
      );

      if (directoryEntry.isDirectory()) {
        if (IGNORED_DIRECTORY_NAMES.has(directoryEntry.name)) {
          continue;
        }
        directoryQueue.push(entryAbsolutePath);
        continue;
      }

      if (directoryEntry.isFile()) {
        discoveredFilePaths.push(entryRelativePath);
      }
    }
  }

  return discoveredFilePaths.toSorted((filePathA, filePathB) =>
    filePathA.localeCompare(filePathB),
  );
};

export const readTextFileSafely = (absoluteFilePath: string): string | null => {
  try {
    return fs.readFileSync(absoluteFilePath, "utf8");
  } catch {
    return null;
  }
};

export const getLineNumberForPattern = (
  fileContent: string,
  pattern: RegExp,
): number => {
  const matchedIndex = fileContent.search(pattern);
  if (matchedIndex < 0) {
    return 0;
  }
  return fileContent.slice(0, matchedIndex).split("\n").length;
};

export const getLineNumberForCharacterIndex = (
  fileContent: string,
  characterIndex: number,
): number => {
  if (characterIndex < 0) {
    return 0;
  }
  return fileContent.slice(0, characterIndex).split("\n").length;
};

export const formatFileSize = (sizeBytes: number): string =>
  sizeBytes < BYTES_PER_KILOBYTE * 1024
    ? `${(sizeBytes / BYTES_PER_KILOBYTE).toFixed(STATIC_ASSET_SIZE_DECIMAL_PLACES_COUNT)}KB`
    : `${(sizeBytes / (BYTES_PER_KILOBYTE * 1024)).toFixed(STATIC_ASSET_SIZE_DECIMAL_PLACES_COUNT)}MB`;

export const createVercelWarningDiagnostic = (
  filePath: string,
  rule: string,
  message: string,
  help: string,
  line = 0,
): Diagnostic => ({
  category: RULE_CATEGORY_NAMES.VERCEL,
  column: 0,
  filePath,
  help,
  line,
  message,
  plugin: OXLINT_PLUGIN_NAME,
  rule,
  severity: "warning",
});

const STATIC_ASSET_EXTENSIONS = new Set([
  ".avif",
  ".bmp",
  ".gif",
  ".ico",
  ".jpeg",
  ".jpg",
  ".m4a",
  ".mov",
  ".mp3",
  ".mp4",
  ".ogg",
  ".pdf",
  ".png",
  ".svg",
  ".ttf",
  ".wav",
  ".webm",
  ".webp",
  ".woff",
  ".woff2",
  ".zip",
]);

const isStaticAssetPath = (relativeFilePath: string): boolean =>
  STATIC_ASSET_EXTENSIONS.has(path.extname(relativeFilePath).toLowerCase());

const collectLargeStaticAssetCandidates = (
  rootDirectory: string,
  projectFilePaths: string[],
  includedPathSet: Set<string> | null,
): StaticAssetCandidate[] => {
  const largeStaticAssetCandidates: StaticAssetCandidate[] = [];

  for (const relativeFilePath of projectFilePaths) {
    if (!isStaticAssetPath(relativeFilePath)) {
      continue;
    }
    if (!shouldInspectPath(relativeFilePath, includedPathSet)) {
      continue;
    }

    const absoluteFilePath = path.join(rootDirectory, relativeFilePath);

    let staticAssetSizeBytes = 0;
    try {
      staticAssetSizeBytes = fs.statSync(absoluteFilePath).size;
    } catch {
      continue;
    }

    if (staticAssetSizeBytes < STATIC_ASSET_CDN_WARNING_THRESHOLD_BYTES) {
      continue;
    }
    largeStaticAssetCandidates.push({
      filePath: relativeFilePath,
      sizeBytes: staticAssetSizeBytes,
    });
  }

  return largeStaticAssetCandidates
    .toSorted(
      (candidateA, candidateB) => candidateB.sizeBytes - candidateA.sizeBytes,
    )
    .slice(0, MAX_STATIC_ASSET_CDN_DIAGNOSTICS_COUNT);
};

const shouldRunConfigCheck = (
  includedPathSet: Set<string> | null,
  configPath: string,
): boolean =>
  includedPathSet === null ||
  includedPathSet.has(normalizeProjectPath(configPath));

export const readVercelConfig = (
  rootDirectory: string,
): VercelConfig | null => {
  const vercelConfigPath = path.join(rootDirectory, VERCEL_JSON_PATH);
  if (!fs.existsSync(vercelConfigPath)) {
    return null;
  }

  const rawConfigContent = readTextFileSafely(vercelConfigPath);
  if (!rawConfigContent) {
    return null;
  }

  let parsedConfig: unknown;
  try {
    parsedConfig = JSON.parse(rawConfigContent);
  } catch {
    return null;
  }
  if (!isObjectRecord(parsedConfig)) {
    return null;
  }

  const parsedVercelConfig: VercelConfig = {};
  const cronsField = parsedConfig.crons;
  if (Array.isArray(cronsField)) {
    const parsedCrons: VercelConfigCron[] = [];
    for (const cronEntry of cronsField) {
      if (!isObjectRecord(cronEntry)) {
        continue;
      }
      const pathValue = cronEntry.path;
      const scheduleValue = cronEntry.schedule;
      if (typeof pathValue === "string" && typeof scheduleValue === "string") {
        parsedCrons.push({ path: pathValue, schedule: scheduleValue });
      }
    }
    if (parsedCrons.length > 0) {
      parsedVercelConfig.crons = parsedCrons;
    }
  }

  const functionsField = parsedConfig.functions;
  if (isObjectRecord(functionsField)) {
    const parsedFunctions: Record<string, VercelConfigFunctionConfig> = {};
    for (const [functionGlob, functionConfigValue] of Object.entries(
      functionsField,
    )) {
      if (!isObjectRecord(functionConfigValue)) {
        continue;
      }
      const runtimeValue =
        typeof functionConfigValue.runtime === "string"
          ? functionConfigValue.runtime
          : undefined;
      const maxDurationValue =
        typeof functionConfigValue.maxDuration === "number"
          ? functionConfigValue.maxDuration
          : undefined;

      parsedFunctions[functionGlob] = {
        maxDuration: maxDurationValue,
        runtime: runtimeValue,
      };
    }
    if (Object.keys(parsedFunctions).length > 0) {
      parsedVercelConfig.functions = parsedFunctions;
    }
  }

  return parsedVercelConfig;
};

const collectBunDiagnostic = (
  rootDirectory: string,
  includedPathSet: Set<string> | null,
  diagnostics: Diagnostic[],
): void => {
  const shouldEvaluatePackageManager =
    shouldRunConfigCheck(includedPathSet, PACKAGE_JSON_PATH) ||
    shouldRunConfigCheck(includedPathSet, BUN_LOCK_PATH) ||
    shouldRunConfigCheck(includedPathSet, BUN_LOCK_BINARY_PATH);

  if (!shouldEvaluatePackageManager) {
    return;
  }

  const packageJsonPath = path.join(rootDirectory, PACKAGE_JSON_PATH);
  if (!fs.existsSync(packageJsonPath)) {
    return;
  }

  let packageJson;
  try {
    packageJson = readPackageJson(packageJsonPath);
  } catch {
    return;
  }

  const packageManagerField = packageJson.packageManager;
  const usesBunPackageManager =
    typeof packageManagerField === "string" &&
    packageManagerField.startsWith("bun@");
  const hasBunLockfile =
    fs.existsSync(path.join(rootDirectory, BUN_LOCK_PATH)) ||
    fs.existsSync(path.join(rootDirectory, BUN_LOCK_BINARY_PATH));

  if (usesBunPackageManager || hasBunLockfile) {
    return;
  }

  diagnostics.push(
    createVercelWarningDiagnostic(
      PACKAGE_JSON_PATH,
      VERCEL_RULE_IDS.CONSIDER_BUN_RUNTIME,
      "Project is not configured for Bun — Bun runtime can reduce install and build overhead on Vercel",
      "Review Bun runtime guidance: https://vercel.com/docs/functions/runtimes/bun",
    ),
  );
};

const collectCronDiagnostic = (
  includedPathSet: Set<string> | null,
  vercelConfig: VercelConfig | null,
  diagnostics: Diagnostic[],
): void => {
  if (!shouldRunConfigCheck(includedPathSet, VERCEL_JSON_PATH)) {
    return;
  }
  if (!vercelConfig?.crons || vercelConfig.crons.length === 0) {
    return;
  }

  diagnostics.push(
    createVercelWarningDiagnostic(
      VERCEL_JSON_PATH,
      VERCEL_RULE_IDS.AVOID_PLATFORM_CRON,
      "Vercel cron jobs are configured in vercel.json — scheduled workloads can often run cheaper outside request runtime billing",
      "Consider GitHub Actions or Cloudflare Workers Cron Triggers for recurring jobs with predictable schedules.",
      1,
    ),
  );
};

const collectFluidComputeDiagnostic = (
  apiRouteCount: number,
  apiRouteFilePaths: string[],
  diagnostics: Diagnostic[],
): void => {
  if (apiRouteCount < FLUID_COMPUTE_ROUTE_THRESHOLD_COUNT) {
    return;
  }

  const referenceFilePath = apiRouteFilePaths[0] ?? PACKAGE_JSON_PATH;
  diagnostics.push(
    createVercelWarningDiagnostic(
      referenceFilePath,
      VERCEL_RULE_IDS.CONSIDER_FLUID_COMPUTE,
      `Detected ${apiRouteCount} server/API routes — evaluate Fluid Compute for better concurrency and lower execution overhead on long-running handlers`,
      "Use Fluid Compute for workloads with variable latency or bursty traffic where it improves runtime efficiency.",
    ),
  );
};

const collectDeployArchiveDiagnostic = (
  projectFilePaths: string[],
  diagnostics: Diagnostic[],
): void => {
  if (projectFilePaths.length < LARGE_PROJECT_FILE_COUNT_THRESHOLD) {
    return;
  }

  diagnostics.push(
    createVercelWarningDiagnostic(
      "package.json",
      VERCEL_RULE_IDS.SUGGEST_DEPLOY_ARCHIVE,
      `Large project (${projectFilePaths.length.toLocaleString()} files) — deployment may hit API rate limits`,
      "Use `vercel deploy --archive=tgz` in CI to upload a single archive instead of many files. Cuts deployment time ~50% and avoids rate limits.",
      0,
    ),
  );
};

export const collectGenericDiagnostics = (
  rootDirectory: string,
  projectFilePaths: string[],
  includedPathSet: Set<string> | null,
  diagnostics: Diagnostic[],
): void => {
  const largeStaticAssetCandidates = collectLargeStaticAssetCandidates(
    rootDirectory,
    projectFilePaths,
    includedPathSet,
  );
  for (const largeStaticAssetCandidate of largeStaticAssetCandidates) {
    diagnostics.push(
      createVercelWarningDiagnostic(
        largeStaticAssetCandidate.filePath,
        VERCEL_RULE_IDS.LARGE_STATIC_ASSET,
        `Large static asset (${formatFileSize(largeStaticAssetCandidate.sizeBytes)}) is served from the app repository — this can consume Vercel bandwidth quickly`,
        "Move large static assets to a CDN/object storage provider (Cloudflare R2, S3, or media CDN) and serve optimized variants.",
      ),
    );
  }

  collectBunDiagnostic(rootDirectory, includedPathSet, diagnostics);
  const vercelConfig = readVercelConfig(rootDirectory);
  collectCronDiagnostic(includedPathSet, vercelConfig, diagnostics);

  const apiRouteFilePaths = projectFilePaths.filter(
    (filePath) =>
      (/(?:^|\/)app\/(?:.*\/)?route\.[cm]?[jt]sx?$/.test(filePath) ||
        /(?:^|\/)pages\/api\/.+\.[cm]?[jt]sx?$/.test(filePath)) &&
      shouldInspectPath(filePath, includedPathSet),
  );
  collectFluidComputeDiagnostic(
    apiRouteFilePaths.length,
    apiRouteFilePaths,
    diagnostics,
  );

  if (includedPathSet === null) {
    collectDeployArchiveDiagnostic(projectFilePaths, diagnostics);
  }
};
