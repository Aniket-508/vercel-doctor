import type { Framework } from "./types.js";

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
  PUBLIC_ENV_SECRET_NAME: "vercel-public-env-secret-name",
  SEQUENTIAL_DATABASE_AWAIT: "vercel-sequential-database-await",
  SUGGEST_DEPLOY_ARCHIVE: "vercel-suggest-deploy-archive",
  SUGGEST_TURBOPACK_BUILD_CACHE: "vercel-suggest-turbopack-build-cache",
};

export const FRAMEWORK_RULE_IDS = {
  ANGULAR_SSR_OUTPUT_DIRECTORY_OVERRIDE:
    "angular-ssr-output-directory-override",
  ASTRO_FRONTMATTER_SEQUENTIAL_FETCH: "astro-frontmatter-sequential-fetch",
  ASTRO_ISR_CACHE_CONTROL_IGNORED: "astro-isr-cache-control-ignored",
  ASTRO_ISR_SEARCH_PARAMS_UNAVAILABLE: "astro-isr-search-params-unavailable",
  ASTRO_MISSING_VERCEL_ADAPTER: "astro-missing-vercel-adapter",
  ASTRO_PREFER_STATIC_OUTPUT: "astro-prefer-static-output",
  ASTRO_RAW_IMG_BYPASSES_OPTIMIZATION: "astro-raw-img-bypasses-optimization",
  GATSBY_DYNAMIC_API_MISSING_REWRITE: "gatsby-dynamic-api-missing-rewrite",
  GATSBY_MANUAL_VERCEL_BUILDER_PLUGIN: "gatsby-manual-vercel-builder-plugin",
  REACT_ROUTER_CUSTOM_ENTRY_SERVER: "react-router-custom-entry-server",
  REACT_ROUTER_MISSING_VERCEL_PRESET: "react-router-missing-vercel-preset",
  REACT_ROUTER_SPA_SERVER_FEATURE: "react-router-spa-server-feature",
  REMIX_CLASSIC_COMPILER: "remix-classic-compiler",
  REMIX_MISSING_VERCEL_PRESET: "remix-missing-vercel-preset",
  REMIX_SPA_SERVER_FEATURE: "remix-spa-server-feature",
  ROUTE_LOADER_CACHE_NOT_FORWARDED: "route-loader-cache-not-forwarded",
  SOLIDSTART_API_NOT_CDN_CACHEABLE: "solidstart-api-not-cdn-cacheable",
  SOLIDSTART_CREATE_ASYNC_API_ROUNDTRIP: "solidstart-create-async-api-roundtrip",
  SOLIDSTART_MISSING_NITRO_PLUGIN: "solidstart-missing-nitro-plugin",
  SOLIDSTART_NON_VERCEL_PRESET: "solidstart-non-vercel-preset",
  TANSTACK_START_BROAD_LOADER_DEPS: "tanstack-start-broad-loader-deps",
  TANSTACK_START_MISSING_NITRO_PLUGIN: "tanstack-start-missing-nitro-plugin",
  TANSTACK_START_NON_VERCEL_PRESET: "tanstack-start-non-vercel-preset",
  TANSTACK_START_ZERO_PRELOAD_STALE_TIME:
    "tanstack-start-zero-preload-stale-time",
  VITE_INLINE_PRODUCTION_SOURCEMAP: "vite-inline-production-sourcemap",
  VITE_SPA_MISSING_REWRITE: "vite-spa-missing-rewrite",
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
  PUBLIC_ENV_SECRET_NAME: "public-env-secret-name",
  ROUTE_SEQUENTIAL_LOADER_AWAIT: "route-sequential-loader-await",
  ROUTE_SERVER_IMPORT_IN_CLIENT_EXPORT: "route-server-import-in-client-export",
  SERVER_AFTER_NONBLOCKING: "server-after-nonblocking",
  SPA_MOUNT_EFFECT_API_WATERFALL: "spa-mount-effect-api-waterfall",
  SVELTEKIT_LOAD_SEQUENTIAL_AWAIT: "sveltekit-load-sequential-await",
  SVELTEKIT_SERVER_IMPORT_IN_CLIENT_LOAD:
    "sveltekit-server-import-in-client-load",
  TANSTACK_START_GET_SERVER_FN_MUTATION:
    "tanstack-start-get-server-fn-mutation",
  TANSTACK_START_MODULE_SCOPE_SECRET: "tanstack-start-module-scope-secret",
  TANSTACK_START_SERVER_API_IN_LOADER: "tanstack-start-server-api-in-loader",
};

export const BASE_PLUGIN_RULE_ID_LIST = [
  PLUGIN_RULE_IDS.SERVER_AFTER_NONBLOCKING,
  PLUGIN_RULE_IDS.ASYNC_PARALLEL,
  PLUGIN_RULE_IDS.PUBLIC_ENV_SECRET_NAME,
];

const ROUTE_MODULE_PLUGIN_RULE_ID_LIST = [
  PLUGIN_RULE_IDS.ROUTE_SEQUENTIAL_LOADER_AWAIT,
  PLUGIN_RULE_IDS.ROUTE_SERVER_IMPORT_IN_CLIENT_EXPORT,
];

const SPA_PLUGIN_RULE_ID_LIST = [
  PLUGIN_RULE_IDS.SPA_MOUNT_EFFECT_API_WATERFALL,
];

export const FRAMEWORK_PLUGIN_RULE_ID_LISTS: Partial<
  Record<Framework, string[]>
> = {
  cra: SPA_PLUGIN_RULE_ID_LIST,
  gatsby: SPA_PLUGIN_RULE_ID_LIST,
  nextjs: [
    PLUGIN_RULE_IDS.NEXTJS_NO_CLIENT_FETCH_FOR_SERVER_DATA,
    PLUGIN_RULE_IDS.NEXTJS_IMAGE_MISSING_SIZES,
    PLUGIN_RULE_IDS.NEXTJS_LINK_PREFETCH_DEFAULT,
    PLUGIN_RULE_IDS.NEXTJS_NO_SIDE_EFFECT_IN_GET_HANDLER,
  ],
  nuxt: [
    PLUGIN_RULE_IDS.NUXT_CONFIG_SSR_FALSE,
    PLUGIN_RULE_IDS.NUXT_NO_TOP_LEVEL_AWAIT_IN_SERVER_ROUTE,
  ],
  "react-router": ROUTE_MODULE_PLUGIN_RULE_ID_LIST,
  remix: ROUTE_MODULE_PLUGIN_RULE_ID_LIST,
  sveltekit: [
    PLUGIN_RULE_IDS.SVELTEKIT_LOAD_SEQUENTIAL_AWAIT,
    PLUGIN_RULE_IDS.SVELTEKIT_SERVER_IMPORT_IN_CLIENT_LOAD,
  ],
  "tanstack-start": [
    PLUGIN_RULE_IDS.TANSTACK_START_GET_SERVER_FN_MUTATION,
    PLUGIN_RULE_IDS.TANSTACK_START_MODULE_SCOPE_SECRET,
    PLUGIN_RULE_IDS.TANSTACK_START_SERVER_API_IN_LOADER,
  ],
  vite: SPA_PLUGIN_RULE_ID_LIST,
};

export const getQualifiedPluginRuleId = (ruleId: string): string =>
  `${OXLINT_PLUGIN_NAME}/${ruleId}`;
