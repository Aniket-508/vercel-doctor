import { VERCEL_RULE_IDS } from "../../rule-ids.js";
import type { Diagnostic, FrameworkCheckProvider } from "../../types.js";
import {
  createVercelWarningDiagnostic,
  getLineNumberForPattern,
  readTextFileSafely,
  shouldInspectPath,
} from "./generic-checks.js";

const NUXT_CONFIG_FILE_PATTERN = /^nuxt\.config\.[cm]?[jt]s$/;
const VUE_FILE_PATTERN = /\.vue$/;
const VUE_SCRIPT_PATTERN = /<script[^>]*>/;

const NUXT_IMG_IMPORT_PATTERN = /from\s+["']@nuxt\/image["']/;
const NUXT_IMG_COMPONENT_PATTERN = /<NuxtImg\b/;
const VUE_IMG_TAG_PATTERN = /<img\b[^>]*>/g;
const VUE_IMG_HAS_UNOPTIMIZED_PATTERN =
  /\bunoptimized(?:\s*=\s*(?:\{\s*true\s*\}|["']true["']))?/;

const NUXT_LINK_COMPONENT_PATTERN = /<NuxtLink\b|<NLink\b/;
const NUXT_LINK_PREFETCH_PATTERN = /prefetch/;

const NUXT_CONFIG_SSR_FALSE_PATTERN = /ssr\s*:\s*false/;

const NUXT_ROUTE_RULES_PATTERN = /routeRules\s*:\s*\{/;

const NUXT_SERVER_DIR_PATTERN =
  /(?:^|\/)server\/(?:api\/|routes\/|middleware\/)/;
const SERVER_AWAIT_PATTERN = /\bawait\b/g;
const SERVER_PROMISE_ALL_PATTERN = /Promise\.all\s*\(/;
const SERVER_AWAIT_LINE_PATTERN = /\bawait\b/;

const NUXT_FETCH_PATTERN = /\$fetch\s*\(/;
const NUXT_USE_FETCH_PATTERN = /useFetch\s*\(/;
const NUXT_USE_ASYNC_DATA_PATTERN = /useAsyncData\s*\(/;

const collectNuxtImageDiagnostics = (
  relativeFilePath: string,
  fileContent: string,
  diagnostics: Diagnostic[],
): void => {
  if (!VUE_FILE_PATTERN.test(relativeFilePath)) {
    return;
  }

  const hasNuxtImgImport = NUXT_IMG_IMPORT_PATTERN.test(fileContent);
  const hasNuxtImgComponent = NUXT_IMG_COMPONENT_PATTERN.test(fileContent);

  if (!hasNuxtImgImport && !hasNuxtImgComponent) {
    for (const imgMatch of fileContent.matchAll(VUE_IMG_TAG_PATTERN)) {
      const [tagContent] = imgMatch;
      const hasUnoptimized = VUE_IMG_HAS_UNOPTIMIZED_PATTERN.test(tagContent);
      if (hasUnoptimized) {
        continue;
      }

      diagnostics.push(
        createVercelWarningDiagnostic(
          relativeFilePath,
          VERCEL_RULE_IDS.IMAGE_GLOBAL_UNOPTIMIZED,
          "Raw `<img>` tag detected — use `<NuxtImg>` from `@nuxt/image` for automatic optimization",
          "Install `@nuxt/image` module and replace `<img>` with `<NuxtImg>` for Vercel Image Optimization support.",
          getLineNumberForPattern(fileContent, VUE_IMG_TAG_PATTERN),
        ),
      );
      break;
    }
  }
};

const collectNuxtPrefetchDiagnostics = (
  relativeFilePath: string,
  fileContent: string,
  diagnostics: Diagnostic[],
): void => {
  if (!VUE_FILE_PATTERN.test(relativeFilePath)) {
    return;
  }

  if (!NUXT_LINK_COMPONENT_PATTERN.test(fileContent)) {
    return;
  }

  if (NUXT_LINK_PREFETCH_PATTERN.test(fileContent)) {
    return;
  }

  const linkMatch = fileContent.match(NUXT_LINK_COMPONENT_PATTERN);
  if (linkMatch) {
    diagnostics.push(
      createVercelWarningDiagnostic(
        relativeFilePath,
        VERCEL_RULE_IDS.MISSING_CACHE_POLICY,
        "`<NuxtLink>` without `prefetch` prop — NuxtLink prefetches by default, adding compute overhead",
        'Add `:prefetch="false"` or `no-prefetch` to non-critical links, or disable globally in nuxt.config.',
        getLineNumberForPattern(fileContent, NUXT_LINK_COMPONENT_PATTERN),
      ),
    );
  }
};

const collectNuxtFetchInTemplateDiagnostics = (
  relativeFilePath: string,
  fileContent: string,
  diagnostics: Diagnostic[],
): void => {
  if (!VUE_FILE_PATTERN.test(relativeFilePath)) {
    return;
  }

  const hasScript = VUE_SCRIPT_PATTERN.test(fileContent);
  if (!hasScript) {
    return;
  }

  const scriptMatch = fileContent.match(/<script[^>]*>([\s\S]*?)<\/script>/);
  if (!scriptMatch) {
    return;
  }

  const [, scriptContent] = scriptMatch;
  if (
    NUXT_USE_FETCH_PATTERN.test(scriptContent) ||
    NUXT_USE_ASYNC_DATA_PATTERN.test(scriptContent)
  ) {
    return;
  }

  if (NUXT_FETCH_PATTERN.test(scriptContent)) {
    diagnostics.push(
      createVercelWarningDiagnostic(
        relativeFilePath,
        VERCEL_RULE_IDS.MISSING_CACHE_POLICY,
        "Raw `$fetch()` in script — use `useFetch()` or `useAsyncData()` for SSR-compatible data fetching",
        "`useFetch()` and `useAsyncData()` handle SSR serialization and avoid duplicate fetches on client hydration.",
        getLineNumberForPattern(scriptContent, NUXT_FETCH_PATTERN),
      ),
    );
  }
};

const collectNuxtServerRouteDiagnostics = (
  relativeFilePath: string,
  fileContent: string,
  diagnostics: Diagnostic[],
): void => {
  if (!NUXT_SERVER_DIR_PATTERN.test(relativeFilePath)) {
    return;
  }

  if (SERVER_PROMISE_ALL_PATTERN.test(fileContent)) {
    return;
  }

  const awaitCount = (fileContent.match(SERVER_AWAIT_PATTERN) ?? []).length;
  if (awaitCount >= 2) {
    diagnostics.push(
      createVercelWarningDiagnostic(
        relativeFilePath,
        VERCEL_RULE_IDS.SEQUENTIAL_DATABASE_AWAIT,
        "Nitro server route appears to run async calls sequentially — parallelizing reduces function duration",
        "Use `Promise.all()` for independent async operations in server route handlers.",
        getLineNumberForPattern(fileContent, SERVER_AWAIT_LINE_PATTERN),
      ),
    );
  }
};

const collectNuxtConfigDiagnostics = (
  rootDirectory: string,
  projectFilePaths: string[],
  includedPathSet: Set<string> | null,
  diagnostics: Diagnostic[],
): void => {
  const configFile = projectFilePaths.find((filePath) =>
    NUXT_CONFIG_FILE_PATTERN.test(filePath),
  );
  if (!configFile || !shouldInspectPath(configFile, includedPathSet)) {
    return;
  }

  const fileContent = readTextFileSafely(`${rootDirectory}/${configFile}`);
  if (!fileContent) {
    return;
  }

  if (NUXT_CONFIG_SSR_FALSE_PATTERN.test(fileContent)) {
    diagnostics.push(
      createVercelWarningDiagnostic(
        configFile,
        VERCEL_RULE_IDS.NO_FORCE_DYNAMIC,
        "Nuxt config has `ssr: false` — this disables server-side rendering and defeats Vercel edge optimization",
        "Enable SSR (remove `ssr: false`) for optimal Vercel deployment with edge rendering.",
        getLineNumberForPattern(fileContent, NUXT_CONFIG_SSR_FALSE_PATTERN),
      ),
    );
  }

  const hasRouteRules = NUXT_ROUTE_RULES_PATTERN.test(fileContent);
  if (!hasRouteRules) {
    diagnostics.push(
      createVercelWarningDiagnostic(
        configFile,
        VERCEL_RULE_IDS.MISSING_CACHE_POLICY,
        "No `routeRules` configured in nuxt.config — add caching strategies for frequently accessed routes",
        "Use `routeRules` to set SWR, ISR, or static rendering per route pattern: `{ '/api/**': { swr: 3600 } }`.",
        getLineNumberForPattern(fileContent, NUXT_CONFIG_SSR_FALSE_PATTERN),
      ),
    );
  }
};

export const nuxtCheckProvider: FrameworkCheckProvider = {
  collectConfigDiagnostics: collectNuxtConfigDiagnostics,
  collectFileDiagnostics: (
    relativeFilePath,
    fileContent,
    _projectContext,
    diagnostics,
  ) => {
    collectNuxtImageDiagnostics(relativeFilePath, fileContent, diagnostics);
    collectNuxtPrefetchDiagnostics(relativeFilePath, fileContent, diagnostics);
    collectNuxtFetchInTemplateDiagnostics(
      relativeFilePath,
      fileContent,
      diagnostics,
    );
    collectNuxtServerRouteDiagnostics(
      relativeFilePath,
      fileContent,
      diagnostics,
    );
  },
  framework: "nuxt",
};
