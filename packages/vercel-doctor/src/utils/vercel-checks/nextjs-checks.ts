import {
  EDGE_FUNCTION_AWAIT_WARNING_THRESHOLD_COUNT,
  NEXT_MAJOR_VERSION_15,
  NEXT_MAJOR_VERSION_16,
  SEQUENTIAL_DATABASE_AWAIT_WARNING_THRESHOLD_COUNT,
} from "../../constants.js";
import { VERCEL_RULE_IDS } from "../../rule-ids.js";
import type {
  Diagnostic,
  FrameworkCheckProvider,
  ProjectInfo,
} from "../../types.js";
import {
  createVercelWarningDiagnostic,
  getLineNumberForPattern,
  getLineNumberForCharacterIndex,
} from "./generic-checks.js";

const APP_PAGE_OR_LAYOUT_FILE_PATTERN =
  /(?:^|\/)app\/(?:.*\/)?(?:page|layout)\.(?:[cm]?[jt]sx?)$/;
const PAGES_ROUTE_FILE_PATTERN =
  /(?:^|\/)pages\/(?!api\/).+\.(?:[cm]?[jt]sx?)$/;
const APP_ROUTE_FILE_PATTERN = /(?:^|\/)app\/(?:.*\/)?route\.(?:[cm]?[jt]sx?)$/;
const PAGES_API_ROUTE_FILE_PATTERN =
  /(?:^|\/)pages\/api\/.+\.(?:[cm]?[jt]sx?)$/;
const MIDDLEWARE_FILE_PATTERN = /(?:^|\/)middleware\.(?:[cm]?[jt]sx?)$/;
const NEXT_CONFIG_FILE_PATTERN = /(?:^|\/)next\.config\.(?:[cm]?[jt]s)$/;

const EDGE_RUNTIME_EXPORT_PATTERN =
  /export\s+const\s+runtime\s*=\s*["']edge["']/;
const FORCE_DYNAMIC_EXPORT_PATTERN =
  /export\s+const\s+dynamic\s*=\s*["']force-dynamic["']/;
const FORCE_STATIC_EXPORT_PATTERN =
  /export\s+const\s+dynamic\s*=\s*["']force-static["']/;
const NO_STORE_FETCH_PATTERN = /cache\s*:\s*["']no-store["']/;
const ZERO_REVALIDATE_PATTERN = /revalidate\s*:\s*0\b/;
const GET_SERVER_SIDE_PROPS_PATTERN =
  /export\s+(?:const|async\s+function)\s+getServerSideProps\b/;
const GET_STATIC_PROPS_PATTERN =
  /export\s+(?:const|async\s+function)\s+getStaticProps\b/;
const REVALIDATE_IN_RETURN_PATTERN = /\brevalidate\s*[:=]/;
const TURBOPACK_CACHE_PATTERN = /\bturbopackFileSystemCacheForBuild\s*:/;
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
const NEXT_CONFIG_UNOPTIMIZED_IMAGE_PATTERN =
  /\bimages\s*:\s*\{[\s\S]*?\bunoptimized\s*:\s*true\b[\s\S]*?\}/m;
const NEXT_IMAGE_REMOTE_PATTERNS_PATTERN =
  /\bremotePatterns\s*:\s*\[([\s\S]*?)\]/m;
const NEXT_IMAGE_REMOTE_PATTERN_OBJECT_PATTERN = /\{[\s\S]*?\}/g;
const NEXT_IMAGE_REMOTE_PATTERN_HOSTNAME_PATTERN =
  /\bhostname\s*:\s*["'][^"']+["']/;
const NEXT_IMAGE_REMOTE_PATTERN_PATHNAME_PATTERN =
  /\bpathname\s*:\s*["']([^"']+)["']/;
const NEXT_IMAGE_BROAD_PATHNAME_PATTERN = /^\/?\*\*$/;
const SEQUENTIAL_DATABASE_AWAIT_PATTERN =
  /await\s+[A-Za-z0-9_$.]*?(?:prisma|db)[A-Za-z0-9_$.]*\.(?:findUnique|findFirst|findMany|create|update|upsert|delete|count|aggregate|groupBy|queryRaw|executeRaw)\s*\(/g;
const SEQUENTIAL_DATABASE_AWAIT_LINE_PATTERN =
  /await\s+[A-Za-z0-9_$.]*?(?:prisma|db)[A-Za-z0-9_$.]*\.(?:findUnique|findFirst|findMany|create|update|upsert|delete|count|aggregate|groupBy|queryRaw|executeRaw)\s*\(/;

const SOURCE_CODE_FILE_PATTERN = /\.(?:[cm]?[jt]sx?)$/;

const isSourceCodePath = (relativeFilePath: string): boolean =>
  SOURCE_CODE_FILE_PATTERN.test(relativeFilePath);

const isApiRoutePath = (relativeFilePath: string): boolean =>
  APP_ROUTE_FILE_PATTERN.test(relativeFilePath) ||
  PAGES_API_ROUTE_FILE_PATTERN.test(relativeFilePath);

const isEdgeRuntimeFile = (
  relativeFilePath: string,
  fileContent: string,
): boolean =>
  MIDDLEWARE_FILE_PATTERN.test(relativeFilePath) ||
  EDGE_RUNTIME_EXPORT_PATTERN.test(fileContent);

const buildNoStoreFetchHelp = (nextMajorVersion: number | null): string => {
  if (nextMajorVersion !== null && nextMajorVersion >= NEXT_MAJOR_VERSION_16) {
    return `For Next.js ${NEXT_MAJOR_VERSION_16}+, prefer \`"use cache"\` with \`cacheLife\`, \`cacheTag\`, and targeted revalidation. Keep \`no-store\` only for truly per-request data.`;
  }

  if (nextMajorVersion === NEXT_MAJOR_VERSION_15) {
    return `Next.js ${NEXT_MAJOR_VERSION_15} defaults fetches to uncached. Add \`cache: "force-cache"\` or \`next: { revalidate: ... }\` for cacheable data.`;
  }

  return "Use cacheable fetches (`force-cache`) or incremental revalidation when real-time data is not required.";
};

const buildMissingCachePolicyHelp = (
  nextMajorVersion: number | null,
): string => {
  if (nextMajorVersion !== null && nextMajorVersion >= NEXT_MAJOR_VERSION_16) {
    return `For cacheable GET routes on Next.js ${NEXT_MAJOR_VERSION_16}+, add \`Cache-Control\` headers or adopt \`"use cache"\` + cache tags to avoid repeated origin work.`;
  }

  if (nextMajorVersion === NEXT_MAJOR_VERSION_15) {
    return `Next.js ${NEXT_MAJOR_VERSION_15} GET handlers are uncached by default. Add \`Cache-Control\`, \`revalidate\`, or cacheable fetch directives.`;
  }

  return "Add `Cache-Control` headers or `revalidate` directives for cacheable GET responses.";
};

const buildEdgeSequentialAwaitHelp = (): string =>
  "Use `Promise.all()` for independent I/O operations in edge handlers.";

const buildSequentialDatabaseAwaitHelp = (): string =>
  "Use `Promise.all()` for independent queries, or consolidate related Prisma reads into a single relational query.";

const collectSsgDiagnostics = (
  relativeFilePath: string,
  fileContent: string,
  nextMajorVersion: number | null,
  diagnostics: Diagnostic[],
): void => {
  if (APP_PAGE_OR_LAYOUT_FILE_PATTERN.test(relativeFilePath)) {
    if (FORCE_DYNAMIC_EXPORT_PATTERN.test(fileContent)) {
      diagnostics.push(
        createVercelWarningDiagnostic(
          relativeFilePath,
          VERCEL_RULE_IDS.NO_FORCE_DYNAMIC,
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
          VERCEL_RULE_IDS.NO_NO_STORE_FETCH,
          "Server fetch disables caching with `no-store` or `revalidate: 0` — this increases uncached bandwidth and compute costs",
          buildNoStoreFetchHelp(nextMajorVersion),
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
        VERCEL_RULE_IDS.PREFER_GET_STATIC_PROPS,
        "Page uses `getServerSideProps` — consider static generation to improve cache hit rate and reduce server bandwidth",
        "Switch to `getStaticProps` (and optional ISR) when data can be cached safely.",
        getLineNumberForPattern(fileContent, GET_SERVER_SIDE_PROPS_PATTERN),
      ),
    );
  }

  if (
    PAGES_ROUTE_FILE_PATTERN.test(relativeFilePath) &&
    GET_STATIC_PROPS_PATTERN.test(fileContent) &&
    !REVALIDATE_IN_RETURN_PATTERN.test(fileContent)
  ) {
    diagnostics.push(
      createVercelWarningDiagnostic(
        relativeFilePath,
        VERCEL_RULE_IDS.GET_STATIC_PROPS_CONSIDER_ISR,
        "`getStaticProps` without `revalidate` — all pages build at deploy time, which can slow builds for large sites",
        "Add `revalidate: 3600` (or similar) to enable ISR — pages generate on-demand and cache, reducing build time significantly.",
        getLineNumberForPattern(fileContent, GET_STATIC_PROPS_PATTERN),
      ),
    );
  }
};

const collectEdgeDiagnostics = (
  relativeFilePath: string,
  fileContent: string,
  diagnostics: Diagnostic[],
): void => {
  if (!isEdgeRuntimeFile(relativeFilePath, fileContent)) {
    return;
  }

  if (EDGE_HEAVY_IMPORT_PATTERN.test(fileContent)) {
    diagnostics.push(
      createVercelWarningDiagnostic(
        relativeFilePath,
        VERCEL_RULE_IDS.EDGE_HEAVY_IMPORT,
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
        VERCEL_RULE_IDS.EDGE_SEQUENTIAL_AWAIT,
        "Edge handler appears to run async calls sequentially — parallelizing independent work reduces billed execution time",
        buildEdgeSequentialAwaitHelp(),
        getLineNumberForPattern(fileContent, AWAIT_LINE_PATTERN),
      ),
    );
  }
};

const collectCachingDiagnostics = (
  relativeFilePath: string,
  fileContent: string,
  nextMajorVersion: number | null,
  diagnostics: Diagnostic[],
): void => {
  if (!isApiRoutePath(relativeFilePath)) {
    return;
  }

  const hasAnyCacheConfiguration =
    CACHE_CONTROL_PATTERN.test(fileContent) ||
    FORCE_STATIC_EXPORT_PATTERN.test(fileContent) ||
    REVALIDATE_EXPORT_PATTERN.test(fileContent) ||
    FORCE_CACHE_PATTERN.test(fileContent) ||
    NEXT_FETCH_REVALIDATE_PATTERN.test(fileContent);

  if (
    APP_ROUTE_FILE_PATTERN.test(relativeFilePath) &&
    APP_ROUTE_GET_HANDLER_PATTERN.test(fileContent) &&
    !hasAnyCacheConfiguration
  ) {
    diagnostics.push(
      createVercelWarningDiagnostic(
        relativeFilePath,
        VERCEL_RULE_IDS.MISSING_CACHE_POLICY,
        "GET route handler has no explicit cache policy — responses may miss CDN caching opportunities",
        buildMissingCachePolicyHelp(nextMajorVersion),
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
        VERCEL_RULE_IDS.MISSING_CACHE_POLICY,
        "API route has no `Cache-Control` header — cacheable responses should declare caching to reduce repeated origin work",
        'Set `res.setHeader("Cache-Control", "s-maxage=..., stale-while-revalidate=...")` for cacheable responses.',
        getLineNumberForPattern(fileContent, PAGES_API_HANDLER_PATTERN),
      ),
    );
  }
};

const collectBuildOptimizationDiagnostics = (
  relativeFilePath: string,
  fileContent: string,
  nextMajorVersion: number | null,
  diagnostics: Diagnostic[],
): void => {
  if (!NEXT_CONFIG_FILE_PATTERN.test(relativeFilePath)) {
    return;
  }
  if (nextMajorVersion !== null && nextMajorVersion < NEXT_MAJOR_VERSION_16) {
    return;
  }

  const hasExperimental = /\bexperimental\s*:\s*\{/m.test(fileContent);
  const hasTurbopackCache = TURBOPACK_CACHE_PATTERN.test(fileContent);
  if (hasExperimental && !hasTurbopackCache) {
    diagnostics.push(
      createVercelWarningDiagnostic(
        relativeFilePath,
        VERCEL_RULE_IDS.SUGGEST_TURBOPACK_BUILD_CACHE,
        "Next.js 16+ supports Turbopack build cache — can reduce build time",
        "Add `turbopackFileSystemCacheForBuild: true` inside `experimental` in next.config. Requires Next.js 16+.",
        getLineNumberForPattern(fileContent, /\bexperimental\s*:/),
      ),
    );
  }
};

const collectNextConfigUnoptimizedDiagnostic = (
  relativeFilePath: string,
  fileContent: string,
  diagnostics: Diagnostic[],
): void => {
  if (
    !NEXT_CONFIG_FILE_PATTERN.test(relativeFilePath) ||
    !NEXT_CONFIG_UNOPTIMIZED_IMAGE_PATTERN.test(fileContent)
  ) {
    return;
  }
  diagnostics.push(
    createVercelWarningDiagnostic(
      relativeFilePath,
      VERCEL_RULE_IDS.IMAGE_GLOBAL_UNOPTIMIZED,
      "next.config enables `images.unoptimized: true` — this disables Vercel Image Optimization globally",
      "Keep optimization enabled and configure image domains/remotePatterns as needed: https://vercel.com/docs/image-optimization",
      getLineNumberForPattern(
        fileContent,
        NEXT_CONFIG_UNOPTIMIZED_IMAGE_PATTERN,
      ),
    ),
  );
};

const collectNextConfigRemotePatternsDiagnostics = (
  relativeFilePath: string,
  fileContent: string,
  diagnostics: Diagnostic[],
): void => {
  if (!NEXT_CONFIG_FILE_PATTERN.test(relativeFilePath)) {
    return;
  }
  const remotePatternsMatch = fileContent.match(
    NEXT_IMAGE_REMOTE_PATTERNS_PATTERN,
  );
  if (!remotePatternsMatch) {
    return;
  }
  const remotePatternsBlockContent = remotePatternsMatch[1] ?? "";
  const remotePatternsStartCharacterIndex = fileContent.indexOf(
    remotePatternsBlockContent,
  );
  if (remotePatternsStartCharacterIndex === -1) {
    return;
  }
  for (const remotePatternMatch of remotePatternsBlockContent.matchAll(
    NEXT_IMAGE_REMOTE_PATTERN_OBJECT_PATTERN,
  )) {
    const [matchedRemotePatternObject] = remotePatternMatch;
    if (
      !NEXT_IMAGE_REMOTE_PATTERN_HOSTNAME_PATTERN.test(
        matchedRemotePatternObject,
      )
    ) {
      continue;
    }
    const pathnameMatch = matchedRemotePatternObject.match(
      NEXT_IMAGE_REMOTE_PATTERN_PATHNAME_PATTERN,
    );
    const hasBroadPathname =
      pathnameMatch &&
      NEXT_IMAGE_BROAD_PATHNAME_PATTERN.test(pathnameMatch[1].trim());
    const isPathnameMissing = !pathnameMatch;
    if (!hasBroadPathname && !isPathnameMissing) {
      continue;
    }
    diagnostics.push(
      createVercelWarningDiagnostic(
        relativeFilePath,
        VERCEL_RULE_IDS.IMAGE_REMOTE_PATTERN_TOO_BROAD,
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
};

const collectImageOptimizationDiagnostics = (
  relativeFilePath: string,
  fileContent: string,
  diagnostics: Diagnostic[],
): void => {
  collectNextConfigUnoptimizedDiagnostic(
    relativeFilePath,
    fileContent,
    diagnostics,
  );
  collectNextConfigRemotePatternsDiagnostics(
    relativeFilePath,
    fileContent,
    diagnostics,
  );
};

const collectDatabaseAwaitDiagnostics = (
  relativeFilePath: string,
  fileContent: string,
  diagnostics: Diagnostic[],
): void => {
  if (!isApiRoutePath(relativeFilePath)) {
    return;
  }
  if (PROMISE_ALL_PATTERN.test(fileContent)) {
    return;
  }

  const sequentialDatabaseAwaitMatches =
    fileContent.match(SEQUENTIAL_DATABASE_AWAIT_PATTERN) ?? [];
  if (
    sequentialDatabaseAwaitMatches.length <
    SEQUENTIAL_DATABASE_AWAIT_WARNING_THRESHOLD_COUNT
  ) {
    return;
  }

  diagnostics.push(
    createVercelWarningDiagnostic(
      relativeFilePath,
      VERCEL_RULE_IDS.SEQUENTIAL_DATABASE_AWAIT,
      "API route appears to run multiple database calls sequentially — this can inflate function duration and cost",
      buildSequentialDatabaseAwaitHelp(),
      getLineNumberForPattern(
        fileContent,
        SEQUENTIAL_DATABASE_AWAIT_LINE_PATTERN,
      ),
    ),
  );
};

const collectFileDiagnostics = (
  relativeFilePath: string,
  fileContent: string,
  projectContext: ProjectInfo,
  diagnostics: Diagnostic[],
): void => {
  if (!isSourceCodePath(relativeFilePath)) {
    return;
  }

  collectSsgDiagnostics(
    relativeFilePath,
    fileContent,
    projectContext.nextMajorVersion,
    diagnostics,
  );
  collectEdgeDiagnostics(relativeFilePath, fileContent, diagnostics);
  collectCachingDiagnostics(
    relativeFilePath,
    fileContent,
    projectContext.nextMajorVersion,
    diagnostics,
  );
  collectImageOptimizationDiagnostics(
    relativeFilePath,
    fileContent,
    diagnostics,
  );
  collectBuildOptimizationDiagnostics(
    relativeFilePath,
    fileContent,
    projectContext.nextMajorVersion,
    diagnostics,
  );
  collectDatabaseAwaitDiagnostics(relativeFilePath, fileContent, diagnostics);
};

export const nextjsCheckProvider: FrameworkCheckProvider = {
  collectFileDiagnostics,
  framework: "nextjs",
};
