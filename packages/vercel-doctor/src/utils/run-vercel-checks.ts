import fs from "node:fs";
import path from "node:path";
import {
  BYTES_PER_MEGABYTE,
  EDGE_FUNCTION_AWAIT_WARNING_THRESHOLD_COUNT,
  FLUID_COMPUTE_ROUTE_THRESHOLD_COUNT,
  MAX_STATIC_ASSET_CDN_DIAGNOSTICS_COUNT,
  PUBLIC_STATIC_ASSET_CDN_WARNING_THRESHOLD_BYTES,
  SEQUENTIAL_DATABASE_AWAIT_WARNING_THRESHOLD_COUNT,
  STATIC_ASSET_CDN_WARNING_THRESHOLD_BYTES,
  STATIC_ASSET_SIZE_DECIMAL_PLACES_COUNT,
} from "../constants.js";
import type {
  Diagnostic,
  StaticAssetCandidate,
  VercelCheckOptions,
  VercelConfig,
  VercelConfigCron,
  VercelConfigFunctionConfig,
} from "../types.js";
import { readPackageJson } from "./read-package-json.js";

const IGNORED_DIRECTORY_NAMES = new Set([
  ".git",
  ".next",
  ".turbo",
  ".vercel",
  "node_modules",
  "dist",
  "build",
  "coverage",
]);

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

const SOURCE_CODE_FILE_PATTERN = /\.(?:[cm]?[jt]sx?)$/;
const APP_PAGE_OR_LAYOUT_FILE_PATTERN = /(?:^|\/)app\/(?:.*\/)?(?:page|layout)\.(?:[cm]?[jt]sx?)$/;
const PAGES_ROUTE_FILE_PATTERN = /(?:^|\/)pages\/(?!api\/).+\.(?:[cm]?[jt]sx?)$/;
const APP_API_ROUTE_FILE_PATTERN = /(?:^|\/)app\/api\/(?:.*\/)?route\.(?:[cm]?[jt]sx?)$/;
const PAGES_API_ROUTE_FILE_PATTERN = /(?:^|\/)pages\/api\/.+\.(?:[cm]?[jt]sx?)$/;
const MIDDLEWARE_FILE_PATTERN = /(?:^|\/)middleware\.(?:[cm]?[jt]sx?)$/;
const NEXT_CONFIG_FILE_PATTERN = /(?:^|\/)next\.config\.(?:[cm]?[jt]s)$/;

const EDGE_RUNTIME_EXPORT_PATTERN = /export\s+const\s+runtime\s*=\s*["']edge["']/;
const FORCE_DYNAMIC_EXPORT_PATTERN = /export\s+const\s+dynamic\s*=\s*["']force-dynamic["']/;
const NO_STORE_FETCH_PATTERN = /cache\s*:\s*["']no-store["']/;
const ZERO_REVALIDATE_PATTERN = /revalidate\s*:\s*0\b/;
const GET_SERVER_SIDE_PROPS_PATTERN = /export\s+(?:const|async\s+function)\s+getServerSideProps\b/;
const APP_ROUTE_GET_HANDLER_PATTERN =
  /export\s+(?:async\s+)?function\s+GET\b|export\s+const\s+GET\b/;
const PAGES_API_HANDLER_PATTERN =
  /export\s+default\s+(?:async\s+)?function\b|export\s+default\s+\w+/;
const EDGE_HEAVY_IMPORT_PATTERN =
  /from\s+["'](?:node:(?:fs|crypto|stream|zlib|child_process)|fs|crypto|stream|zlib|child_process|sharp|@aws-sdk\/[^"']+)["']/;
const CACHE_CONTROL_PATTERN = /Cache-Control|s-maxage|stale-while-revalidate/i;
const REVALIDATE_EXPORT_PATTERN = /export\s+const\s+revalidate\s*=\s*\d+/;
const FORCE_CACHE_PATTERN = /cache\s*:\s*["']force-cache["']/;
const NEXT_FETCH_REVALIDATE_PATTERN = /next\s*:\s*\{[^}]*revalidate\s*:/s;
const PROMISE_ALL_PATTERN = /Promise\.all\s*\(/;
const AWAIT_TOKEN_PATTERN = /\bawait\b/g;
const AWAIT_LINE_PATTERN = /\bawait\b/;
const NEXT_LINK_IMPORT_PATTERN = /from\s+["']next\/link["']/;
const LINK_WITH_PREFETCH_DISABLED_PATTERN = /<Link\b[^>]*\bprefetch\s*=\s*\{\s*false\s*\}[^>]*>/g;
const INTERNAL_LINK_HREF_PATTERN =
  /\bhref\s*=\s*(?:"\/[^"]*"|'\/[^']*'|\{\s*["']\/[^"']*["']\s*\})/;
const NEXT_IMAGE_IMPORT_PATTERN = /from\s+["']next\/image["']/;
const IMAGE_WITH_UNOPTIMIZED_PATTERN =
  /<Image\b[^>]*\bunoptimized(?:\s*=\s*(?:\{\s*true\s*\}|["']true["']))?[^>]*>/g;
const NEXT_CONFIG_UNOPTIMIZED_IMAGE_PATTERN =
  /\bimages\s*:\s*\{[\s\S]*?\bunoptimized\s*:\s*true\b[\s\S]*?\}/m;
const NEXT_IMAGE_REMOTE_PATTERNS_PATTERN = /\bremotePatterns\s*:\s*\[([\s\S]*?)\]/m;
const NEXT_IMAGE_REMOTE_PATTERN_OBJECT_PATTERN = /\{[\s\S]*?\}/g;
const NEXT_IMAGE_REMOTE_PATTERN_HOSTNAME_PATTERN = /\bhostname\s*:\s*["'][^"']+["']/;
const NEXT_IMAGE_REMOTE_PATTERN_PATHNAME_PATTERN = /\bpathname\s*:\s*["']([^"']+)["']/;
const NEXT_IMAGE_BROAD_PATHNAME_PATTERN = /^\/?\*\*$/;
const SEQUENTIAL_DATABASE_AWAIT_PATTERN =
  /await\s+[A-Za-z0-9_$.]*?(?:prisma|db)[A-Za-z0-9_$.]*\.(?:findUnique|findFirst|findMany|create|update|upsert|delete|count|aggregate|groupBy|queryRaw|executeRaw)\s*\(/g;
const SEQUENTIAL_DATABASE_AWAIT_LINE_PATTERN =
  /await\s+[A-Za-z0-9_$.]*?(?:prisma|db)[A-Za-z0-9_$.]*\.(?:findUnique|findFirst|findMany|create|update|upsert|delete|count|aggregate|groupBy|queryRaw|executeRaw)\s*\(/;

const VERCEL_JSON_PATH = "vercel.json";
const PACKAGE_JSON_PATH = "package.json";
const BUN_LOCK_PATH = "bun.lock";
const BUN_LOCK_BINARY_PATH = "bun.lockb";

const normalizeProjectPath = (filePath: string): string =>
  filePath.replace(/\\/g, "/").replace(/^\.\//, "");

const isObjectRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const buildIncludedPathSet = (
  rootDirectory: string,
  includePaths?: string[],
): Set<string> | null => {
  if (!includePaths || includePaths.length === 0) return null;

  const includedPathSet = new Set<string>();
  for (const includePath of includePaths) {
    const relativeIncludePath = path.isAbsolute(includePath)
      ? path.relative(rootDirectory, includePath)
      : includePath;
    includedPathSet.add(normalizeProjectPath(relativeIncludePath));
  }
  return includedPathSet;
};

const shouldInspectPath = (
  relativeFilePath: string,
  includedPathSet: Set<string> | null,
): boolean =>
  includedPathSet === null || includedPathSet.has(normalizeProjectPath(relativeFilePath));

const collectProjectFilePaths = (rootDirectory: string): string[] => {
  const discoveredFilePaths: string[] = [];
  const directoryQueue = [rootDirectory];

  while (directoryQueue.length > 0) {
    const currentDirectory = directoryQueue.pop();
    if (!currentDirectory) continue;

    let directoryEntries: fs.Dirent[] = [];
    try {
      directoryEntries = fs.readdirSync(currentDirectory, { withFileTypes: true });
    } catch {
      continue;
    }

    for (const directoryEntry of directoryEntries) {
      const entryAbsolutePath = path.join(currentDirectory, directoryEntry.name);
      const entryRelativePath = normalizeProjectPath(
        path.relative(rootDirectory, entryAbsolutePath),
      );

      if (directoryEntry.isDirectory()) {
        if (IGNORED_DIRECTORY_NAMES.has(directoryEntry.name)) continue;
        directoryQueue.push(entryAbsolutePath);
        continue;
      }

      if (directoryEntry.isFile()) {
        discoveredFilePaths.push(entryRelativePath);
      }
    }
  }

  return discoveredFilePaths.toSorted((filePathA, filePathB) => filePathA.localeCompare(filePathB));
};

const isStaticAssetPath = (relativeFilePath: string): boolean =>
  STATIC_ASSET_EXTENSIONS.has(path.extname(relativeFilePath).toLowerCase());

const isPublicAssetPath = (relativeFilePath: string): boolean =>
  relativeFilePath.startsWith("public/");

const isSourceCodePath = (relativeFilePath: string): boolean =>
  SOURCE_CODE_FILE_PATTERN.test(relativeFilePath);

const isApiRoutePath = (relativeFilePath: string): boolean =>
  APP_API_ROUTE_FILE_PATTERN.test(relativeFilePath) ||
  PAGES_API_ROUTE_FILE_PATTERN.test(relativeFilePath);

const isEdgeRuntimeFile = (relativeFilePath: string, fileContent: string): boolean =>
  MIDDLEWARE_FILE_PATTERN.test(relativeFilePath) || EDGE_RUNTIME_EXPORT_PATTERN.test(fileContent);

const readTextFileSafely = (absoluteFilePath: string): string | null => {
  try {
    return fs.readFileSync(absoluteFilePath, "utf-8");
  } catch {
    return null;
  }
};

const getLineNumberForPattern = (fileContent: string, pattern: RegExp): number => {
  const matchedIndex = fileContent.search(pattern);
  if (matchedIndex < 0) return 0;
  return fileContent.slice(0, matchedIndex).split("\n").length;
};

const getLineNumberForCharacterIndex = (fileContent: string, characterIndex: number): number => {
  if (characterIndex < 0) return 0;
  return fileContent.slice(0, characterIndex).split("\n").length;
};

const formatMegabytes = (sizeBytes: number): string =>
  `${(sizeBytes / BYTES_PER_MEGABYTE).toFixed(STATIC_ASSET_SIZE_DECIMAL_PLACES_COUNT)}MB`;

const createVercelWarningDiagnostic = (
  filePath: string,
  rule: string,
  message: string,
  help: string,
  line = 0,
): Diagnostic => ({
  filePath,
  plugin: "vercel-doctor",
  rule,
  severity: "warning",
  message,
  help,
  line,
  column: 0,
  category: "Vercel",
});

const readVercelConfig = (rootDirectory: string): VercelConfig | null => {
  const vercelConfigPath = path.join(rootDirectory, VERCEL_JSON_PATH);
  if (!fs.existsSync(vercelConfigPath)) return null;

  const rawConfigContent = readTextFileSafely(vercelConfigPath);
  if (!rawConfigContent) return null;

  let parsedConfig: unknown;
  try {
    parsedConfig = JSON.parse(rawConfigContent);
  } catch {
    return null;
  }
  if (!isObjectRecord(parsedConfig)) return null;

  const parsedVercelConfig: VercelConfig = {};
  const cronsField = parsedConfig.crons;
  if (Array.isArray(cronsField)) {
    const parsedCrons: VercelConfigCron[] = [];
    for (const cronEntry of cronsField) {
      if (!isObjectRecord(cronEntry)) continue;
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
    for (const [functionGlob, functionConfigValue] of Object.entries(functionsField)) {
      if (!isObjectRecord(functionConfigValue)) continue;
      const runtimeValue =
        typeof functionConfigValue.runtime === "string" ? functionConfigValue.runtime : undefined;
      const maxDurationValue =
        typeof functionConfigValue.maxDuration === "number"
          ? functionConfigValue.maxDuration
          : undefined;

      parsedFunctions[functionGlob] = {
        runtime: runtimeValue,
        maxDuration: maxDurationValue,
      };
    }
    if (Object.keys(parsedFunctions).length > 0) {
      parsedVercelConfig.functions = parsedFunctions;
    }
  }

  return parsedVercelConfig;
};

const collectLargeStaticAssetCandidates = (
  rootDirectory: string,
  projectFilePaths: string[],
  includedPathSet: Set<string> | null,
): StaticAssetCandidate[] => {
  const largeStaticAssetCandidates: StaticAssetCandidate[] = [];

  for (const relativeFilePath of projectFilePaths) {
    if (!isStaticAssetPath(relativeFilePath)) continue;
    if (!shouldInspectPath(relativeFilePath, includedPathSet)) continue;

    const absoluteFilePath = path.join(rootDirectory, relativeFilePath);

    let staticAssetSizeBytes = 0;
    try {
      staticAssetSizeBytes = fs.statSync(absoluteFilePath).size;
    } catch {
      continue;
    }

    const staticAssetWarningThresholdBytes = isPublicAssetPath(relativeFilePath)
      ? PUBLIC_STATIC_ASSET_CDN_WARNING_THRESHOLD_BYTES
      : STATIC_ASSET_CDN_WARNING_THRESHOLD_BYTES;

    if (staticAssetSizeBytes < staticAssetWarningThresholdBytes) continue;
    largeStaticAssetCandidates.push({
      filePath: relativeFilePath,
      sizeBytes: staticAssetSizeBytes,
    });
  }

  return largeStaticAssetCandidates
    .toSorted((candidateA, candidateB) => candidateB.sizeBytes - candidateA.sizeBytes)
    .slice(0, MAX_STATIC_ASSET_CDN_DIAGNOSTICS_COUNT);
};

const collectSsgDiagnostics = (
  relativeFilePath: string,
  fileContent: string,
  diagnostics: Diagnostic[],
): void => {
  if (APP_PAGE_OR_LAYOUT_FILE_PATTERN.test(relativeFilePath)) {
    if (FORCE_DYNAMIC_EXPORT_PATTERN.test(fileContent)) {
      diagnostics.push(
        createVercelWarningDiagnostic(
          relativeFilePath,
          "vercel-no-force-dynamic",
          'Page sets `dynamic = "force-dynamic"` — this forces SSR and bypasses full-page caching',
          "Use static rendering where possible. Prefer `revalidate` or cacheable fetches for routes that do not require per-request rendering.",
          getLineNumberForPattern(fileContent, FORCE_DYNAMIC_EXPORT_PATTERN),
        ),
      );
    }

    const hasNoStoreFetch = NO_STORE_FETCH_PATTERN.test(fileContent);
    const hasZeroRevalidate = ZERO_REVALIDATE_PATTERN.test(fileContent);

    if (hasNoStoreFetch || hasZeroRevalidate) {
      diagnostics.push(
        createVercelWarningDiagnostic(
          relativeFilePath,
          "vercel-no-no-store-fetch",
          "Server fetch disables caching with `no-store` or `revalidate: 0` — this increases uncached bandwidth and compute costs",
          "Use cacheable fetches (`force-cache`) or incremental revalidation when real-time data is not required.",
          getLineNumberForPattern(
            fileContent,
            hasNoStoreFetch ? NO_STORE_FETCH_PATTERN : ZERO_REVALIDATE_PATTERN,
          ),
        ),
      );
    }
  }

  if (
    PAGES_ROUTE_FILE_PATTERN.test(relativeFilePath) &&
    GET_SERVER_SIDE_PROPS_PATTERN.test(fileContent)
  ) {
    diagnostics.push(
      createVercelWarningDiagnostic(
        relativeFilePath,
        "vercel-prefer-get-static-props",
        "Page uses `getServerSideProps` — consider static generation to improve cache hit rate and reduce server bandwidth",
        "Switch to `getStaticProps` (and optional ISR) when data can be cached safely.",
        getLineNumberForPattern(fileContent, GET_SERVER_SIDE_PROPS_PATTERN),
      ),
    );
  }
};

const collectEdgeDiagnostics = (
  relativeFilePath: string,
  fileContent: string,
  diagnostics: Diagnostic[],
): void => {
  if (!isEdgeRuntimeFile(relativeFilePath, fileContent)) return;

  if (EDGE_HEAVY_IMPORT_PATTERN.test(fileContent)) {
    diagnostics.push(
      createVercelWarningDiagnostic(
        relativeFilePath,
        "vercel-edge-heavy-import",
        "Edge runtime imports heavy or Node-centric dependencies — this can increase edge execution latency",
        "Move heavy logic to Node runtime functions or background jobs, and keep edge handlers lightweight.",
        getLineNumberForPattern(fileContent, EDGE_HEAVY_IMPORT_PATTERN),
      ),
    );
  }

  const awaitCount = (fileContent.match(AWAIT_TOKEN_PATTERN) ?? []).length;
  if (
    awaitCount >= EDGE_FUNCTION_AWAIT_WARNING_THRESHOLD_COUNT &&
    !PROMISE_ALL_PATTERN.test(fileContent)
  ) {
    diagnostics.push(
      createVercelWarningDiagnostic(
        relativeFilePath,
        "vercel-edge-sequential-await",
        "Edge handler appears to run async calls sequentially — parallelizing independent work reduces billed execution time",
        "Use `Promise.all()` for independent I/O operations in edge handlers.",
        getLineNumberForPattern(fileContent, AWAIT_LINE_PATTERN),
      ),
    );
  }
};

const collectCachingDiagnostics = (
  relativeFilePath: string,
  fileContent: string,
  diagnostics: Diagnostic[],
): void => {
  if (!isApiRoutePath(relativeFilePath)) return;

  const hasAnyCacheConfiguration =
    CACHE_CONTROL_PATTERN.test(fileContent) ||
    REVALIDATE_EXPORT_PATTERN.test(fileContent) ||
    FORCE_CACHE_PATTERN.test(fileContent) ||
    NEXT_FETCH_REVALIDATE_PATTERN.test(fileContent);

  if (
    APP_API_ROUTE_FILE_PATTERN.test(relativeFilePath) &&
    APP_ROUTE_GET_HANDLER_PATTERN.test(fileContent) &&
    !hasAnyCacheConfiguration
  ) {
    diagnostics.push(
      createVercelWarningDiagnostic(
        relativeFilePath,
        "vercel-missing-cache-policy",
        "GET route handler has no explicit cache policy — responses may miss CDN caching opportunities",
        "Add `Cache-Control` headers or `revalidate` directives for cacheable GET responses.",
        getLineNumberForPattern(fileContent, APP_ROUTE_GET_HANDLER_PATTERN),
      ),
    );
  }

  if (
    PAGES_API_ROUTE_FILE_PATTERN.test(relativeFilePath) &&
    PAGES_API_HANDLER_PATTERN.test(fileContent) &&
    !CACHE_CONTROL_PATTERN.test(fileContent)
  ) {
    diagnostics.push(
      createVercelWarningDiagnostic(
        relativeFilePath,
        "vercel-missing-cache-policy",
        "API route has no `Cache-Control` header — cacheable responses should declare caching to reduce repeated origin work",
        'Set `res.setHeader("Cache-Control", "s-maxage=..., stale-while-revalidate=...")` for cacheable responses.',
        getLineNumberForPattern(fileContent, PAGES_API_HANDLER_PATTERN),
      ),
    );
  }
};

const collectPrefetchDiagnostics = (
  relativeFilePath: string,
  fileContent: string,
  diagnostics: Diagnostic[],
): void => {
  if (!NEXT_LINK_IMPORT_PATTERN.test(fileContent)) return;

  for (const linkMatch of fileContent.matchAll(LINK_WITH_PREFETCH_DISABLED_PATTERN)) {
    const matchedLinkElement = linkMatch[0];
    if (!INTERNAL_LINK_HREF_PATTERN.test(matchedLinkElement)) continue;

    diagnostics.push(
      createVercelWarningDiagnostic(
        relativeFilePath,
        "vercel-link-prefetch-disabled",
        "Internal next/link has `prefetch={false}` — this can reduce route cache warmup and increase navigation latency",
        "Enable prefetch for cacheable internal routes, and disable it only for intentionally uncached or highly personalized pages.",
        getLineNumberForCharacterIndex(fileContent, linkMatch.index ?? -1),
      ),
    );
    return;
  }
};

const collectImageOptimizationDiagnostics = (
  relativeFilePath: string,
  fileContent: string,
  diagnostics: Diagnostic[],
): void => {
  if (
    NEXT_CONFIG_FILE_PATTERN.test(relativeFilePath) &&
    NEXT_CONFIG_UNOPTIMIZED_IMAGE_PATTERN.test(fileContent)
  ) {
    diagnostics.push(
      createVercelWarningDiagnostic(
        relativeFilePath,
        "vercel-image-global-unoptimized",
        "next.config enables `images.unoptimized: true` — this disables Vercel Image Optimization globally",
        "Keep optimization enabled and configure image domains/remotePatterns as needed: https://vercel.com/docs/image-optimization",
        getLineNumberForPattern(fileContent, NEXT_CONFIG_UNOPTIMIZED_IMAGE_PATTERN),
      ),
    );
  }

  if (NEXT_CONFIG_FILE_PATTERN.test(relativeFilePath)) {
    const remotePatternsMatch = fileContent.match(NEXT_IMAGE_REMOTE_PATTERNS_PATTERN);
    if (remotePatternsMatch) {
      const remotePatternsBlockContent = remotePatternsMatch[1] ?? "";
      const remotePatternsStartCharacterIndex = fileContent.indexOf(remotePatternsBlockContent);

      if (remotePatternsStartCharacterIndex >= 0) {
        for (const remotePatternMatch of remotePatternsBlockContent.matchAll(
          NEXT_IMAGE_REMOTE_PATTERN_OBJECT_PATTERN,
        )) {
          const matchedRemotePatternObject = remotePatternMatch[0];
          if (!NEXT_IMAGE_REMOTE_PATTERN_HOSTNAME_PATTERN.test(matchedRemotePatternObject))
            continue;

          const pathnameMatch = matchedRemotePatternObject.match(
            NEXT_IMAGE_REMOTE_PATTERN_PATHNAME_PATTERN,
          );
          const hasBroadPathname =
            pathnameMatch && NEXT_IMAGE_BROAD_PATHNAME_PATTERN.test(pathnameMatch[1].trim());
          const isPathnameMissing = !pathnameMatch;

          if (!hasBroadPathname && !isPathnameMissing) continue;

          diagnostics.push(
            createVercelWarningDiagnostic(
              relativeFilePath,
              "vercel-image-remote-pattern-too-broad",
              "next.config image remotePatterns is too broad — unrestricted remote image paths can drive unexpected optimization usage",
              "Restrict `images.remotePatterns.pathname` to app-specific prefixes instead of `/**`, and avoid patterns that omit pathname entirely: https://vercel.com/docs/image-optimization",
              getLineNumberForCharacterIndex(
                fileContent,
                remotePatternsStartCharacterIndex + (remotePatternMatch.index ?? 0),
              ),
            ),
          );
          break;
        }
      }
    }
  }

  if (!NEXT_IMAGE_IMPORT_PATTERN.test(fileContent)) return;

  for (const imageMatch of fileContent.matchAll(IMAGE_WITH_UNOPTIMIZED_PATTERN)) {
    diagnostics.push(
      createVercelWarningDiagnostic(
        relativeFilePath,
        "vercel-image-unoptimized-prop",
        "next/image uses the `unoptimized` prop — this bypasses Vercel's image transformation and caching pipeline",
        "Remove `unoptimized` unless you intentionally offload optimization to another image CDN: https://vercel.com/docs/image-optimization",
        getLineNumberForCharacterIndex(fileContent, imageMatch.index ?? -1),
      ),
    );
    return;
  }
};

const collectDatabaseAwaitDiagnostics = (
  relativeFilePath: string,
  fileContent: string,
  diagnostics: Diagnostic[],
): void => {
  if (!isApiRoutePath(relativeFilePath)) return;
  if (PROMISE_ALL_PATTERN.test(fileContent)) return;

  const sequentialDatabaseAwaitMatches = fileContent.match(SEQUENTIAL_DATABASE_AWAIT_PATTERN) ?? [];
  if (sequentialDatabaseAwaitMatches.length < SEQUENTIAL_DATABASE_AWAIT_WARNING_THRESHOLD_COUNT)
    return;

  diagnostics.push(
    createVercelWarningDiagnostic(
      relativeFilePath,
      "vercel-sequential-database-await",
      "API route appears to run multiple database calls sequentially — this can inflate function duration and cost",
      "Use `Promise.all()` for independent queries, or consolidate related Prisma reads into a single relational query.",
      getLineNumberForPattern(fileContent, SEQUENTIAL_DATABASE_AWAIT_LINE_PATTERN),
    ),
  );
};

const shouldRunConfigCheck = (includedPathSet: Set<string> | null, configPath: string): boolean =>
  includedPathSet === null || includedPathSet.has(normalizeProjectPath(configPath));

const collectBunDiagnostic = (
  rootDirectory: string,
  includedPathSet: Set<string> | null,
  diagnostics: Diagnostic[],
): void => {
  const shouldEvaluatePackageManager =
    shouldRunConfigCheck(includedPathSet, PACKAGE_JSON_PATH) ||
    shouldRunConfigCheck(includedPathSet, BUN_LOCK_PATH) ||
    shouldRunConfigCheck(includedPathSet, BUN_LOCK_BINARY_PATH);

  if (!shouldEvaluatePackageManager) return;

  const packageJsonPath = path.join(rootDirectory, PACKAGE_JSON_PATH);
  if (!fs.existsSync(packageJsonPath)) return;

  let packageJson;
  try {
    packageJson = readPackageJson(packageJsonPath);
  } catch {
    return;
  }

  const packageManagerField = packageJson.packageManager;
  const usesBunPackageManager =
    typeof packageManagerField === "string" && packageManagerField.startsWith("bun@");
  const hasBunLockfile =
    fs.existsSync(path.join(rootDirectory, BUN_LOCK_PATH)) ||
    fs.existsSync(path.join(rootDirectory, BUN_LOCK_BINARY_PATH));

  if (usesBunPackageManager || hasBunLockfile) return;

  diagnostics.push(
    createVercelWarningDiagnostic(
      PACKAGE_JSON_PATH,
      "vercel-consider-bun-runtime",
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
  if (!shouldRunConfigCheck(includedPathSet, VERCEL_JSON_PATH)) return;
  if (!vercelConfig?.crons || vercelConfig.crons.length === 0) return;

  diagnostics.push(
    createVercelWarningDiagnostic(
      VERCEL_JSON_PATH,
      "vercel-avoid-platform-cron",
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
  if (apiRouteCount < FLUID_COMPUTE_ROUTE_THRESHOLD_COUNT) return;

  const referenceFilePath = apiRouteFilePaths[0] ?? PACKAGE_JSON_PATH;
  diagnostics.push(
    createVercelWarningDiagnostic(
      referenceFilePath,
      "vercel-consider-fluid-compute",
      `Detected ${apiRouteCount} server/API routes — evaluate Fluid Compute for better concurrency and lower execution overhead on long-running handlers`,
      "Use Fluid Compute for workloads with variable latency or bursty traffic where it improves runtime efficiency.",
    ),
  );
};

export const runVercelChecks = (
  rootDirectory: string,
  options: VercelCheckOptions = {},
): Diagnostic[] => {
  const diagnostics: Diagnostic[] = [];
  const includedPathSet = buildIncludedPathSet(rootDirectory, options.includePaths);
  const projectFilePaths = collectProjectFilePaths(rootDirectory);

  const largeStaticAssetCandidates = collectLargeStaticAssetCandidates(
    rootDirectory,
    projectFilePaths,
    includedPathSet,
  );
  for (const largeStaticAssetCandidate of largeStaticAssetCandidates) {
    diagnostics.push(
      createVercelWarningDiagnostic(
        largeStaticAssetCandidate.filePath,
        "vercel-large-static-asset",
        `Large static asset (${formatMegabytes(largeStaticAssetCandidate.sizeBytes)}) is served from the app repository — this can consume Vercel bandwidth quickly`,
        "Move large static assets to a CDN/object storage provider (Cloudflare R2, S3, or media CDN) and serve optimized variants.",
      ),
    );
  }

  const apiRouteFilePaths: string[] = [];
  for (const relativeFilePath of projectFilePaths) {
    if (!shouldInspectPath(relativeFilePath, includedPathSet)) continue;
    if (!isSourceCodePath(relativeFilePath)) continue;

    const absoluteFilePath = path.join(rootDirectory, relativeFilePath);
    const fileContent = readTextFileSafely(absoluteFilePath);
    if (!fileContent) continue;

    collectSsgDiagnostics(relativeFilePath, fileContent, diagnostics);
    collectEdgeDiagnostics(relativeFilePath, fileContent, diagnostics);
    collectCachingDiagnostics(relativeFilePath, fileContent, diagnostics);
    collectPrefetchDiagnostics(relativeFilePath, fileContent, diagnostics);
    collectImageOptimizationDiagnostics(relativeFilePath, fileContent, diagnostics);
    collectDatabaseAwaitDiagnostics(relativeFilePath, fileContent, diagnostics);

    if (isApiRoutePath(relativeFilePath)) {
      apiRouteFilePaths.push(relativeFilePath);
    }
  }

  collectBunDiagnostic(rootDirectory, includedPathSet, diagnostics);
  const vercelConfig = readVercelConfig(rootDirectory);
  collectCronDiagnostic(includedPathSet, vercelConfig, diagnostics);
  collectFluidComputeDiagnostic(apiRouteFilePaths.length, apiRouteFilePaths, diagnostics);

  return diagnostics;
};
