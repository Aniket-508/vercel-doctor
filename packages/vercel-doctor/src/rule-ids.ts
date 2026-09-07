export const OXLINT_PLUGIN_NAME = "vercel-doctor";

export const VERCEL_RULE_IDS = {
  AVOID_PLATFORM_CRON: "vercel-avoid-platform-cron",
  CONSIDER_BUN_RUNTIME: "vercel-consider-bun-runtime",
  CONSIDER_FLUID_COMPUTE: "vercel-consider-fluid-compute",
  EDGE_HEAVY_IMPORT: "vercel-edge-heavy-import",
  EDGE_SEQUENTIAL_AWAIT: "vercel-edge-sequential-await",
  GET_STATIC_PROPS_CONSIDER_ISR: "vercel-get-static-props-consider-isr",
  IMAGE_GLOBAL_UNOPTIMIZED: "vercel-image-global-unoptimized",
  IMAGE_REMOTE_PATTERN_TOO_BROAD: "vercel-image-remote-pattern-too-broad",
  LARGE_STATIC_ASSET: "vercel-large-static-asset",
  MISSING_CACHE_POLICY: "vercel-missing-cache-policy",
  MISSING_FUNCTION_TIMEOUT: "vercel-missing-function-timeout",
  NO_FORCE_DYNAMIC: "vercel-no-force-dynamic",
  NO_NO_STORE_FETCH: "vercel-no-no-store-fetch",
  PREFER_GET_STATIC_PROPS: "vercel-prefer-get-static-props",
  SEQUENTIAL_DATABASE_AWAIT: "vercel-sequential-database-await",
  SUGGEST_DEPLOY_ARCHIVE: "vercel-suggest-deploy-archive",
  SUGGEST_TURBOPACK_BUILD_CACHE: "vercel-suggest-turbopack-build-cache",
};

export const PLUGIN_RULE_IDS = {
  ASYNC_PARALLEL: "async-parallel",
  NEXTJS_IMAGE_MISSING_SIZES: "nextjs-image-missing-sizes",
  NEXTJS_LINK_PREFETCH_DEFAULT: "nextjs-link-prefetch-default",
  NEXTJS_NO_CLIENT_FETCH_FOR_SERVER_DATA:
    "nextjs-no-client-fetch-for-server-data",
  NEXTJS_NO_SIDE_EFFECT_IN_GET_HANDLER: "nextjs-no-side-effect-in-get-handler",
  NUXT_CONFIG_SSR_FALSE: "nuxt-config-ssr-false",
  NUXT_NO_TOP_LEVEL_AWAIT_IN_SERVER_ROUTE:
    "nuxt-no-top-level-await-in-server-route",
  SERVER_AFTER_NONBLOCKING: "server-after-nonblocking",
  SVELTEKIT_LOAD_SEQUENTIAL_AWAIT: "sveltekit-load-sequential-await",
  SVELTEKIT_SERVER_IMPORT_IN_CLIENT_LOAD:
    "sveltekit-server-import-in-client-load",
};

export const BASE_PLUGIN_RULE_ID_LIST = [
  PLUGIN_RULE_IDS.SERVER_AFTER_NONBLOCKING,
  PLUGIN_RULE_IDS.ASYNC_PARALLEL,
];

export const NEXTJS_PLUGIN_RULE_ID_LIST = [
  PLUGIN_RULE_IDS.NEXTJS_NO_CLIENT_FETCH_FOR_SERVER_DATA,
  PLUGIN_RULE_IDS.NEXTJS_IMAGE_MISSING_SIZES,
  PLUGIN_RULE_IDS.NEXTJS_LINK_PREFETCH_DEFAULT,
  PLUGIN_RULE_IDS.NEXTJS_NO_SIDE_EFFECT_IN_GET_HANDLER,
];

export const NUXT_PLUGIN_RULE_ID_LIST = [
  PLUGIN_RULE_IDS.NUXT_CONFIG_SSR_FALSE,
  PLUGIN_RULE_IDS.NUXT_NO_TOP_LEVEL_AWAIT_IN_SERVER_ROUTE,
];

export const SVELTEKIT_PLUGIN_RULE_ID_LIST = [
  PLUGIN_RULE_IDS.SVELTEKIT_LOAD_SEQUENTIAL_AWAIT,
  PLUGIN_RULE_IDS.SVELTEKIT_SERVER_IMPORT_IN_CLIENT_LOAD,
];

export const getQualifiedPluginRuleId = (ruleId: string): string =>
  `${OXLINT_PLUGIN_NAME}/${ruleId}`;
