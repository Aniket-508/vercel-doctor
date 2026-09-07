import { OXLINT_PLUGIN_NAME, PLUGIN_RULE_IDS } from "../rule-ids.js";
import { asyncParallel } from "./rules/js-performance.js";
import {
  nextjsImageMissingSizes,
  nextjsLinkPrefetchDefault,
  nextjsNoClientFetchForServerData,
  nextjsNoSideEffectInGetHandler,
} from "./rules/nextjs.js";
import {
  nuxtConfigSsrFalse,
  nuxtNoTopLevelAwaitInServerRoute,
} from "./rules/nuxt.js";
import { serverAfterNonblocking } from "./rules/server.js";
import {
  sveltekitLoadSequentialAwait,
  sveltekitServerImportInClientLoad,
} from "./rules/sveltekit.js";
import type { RulePlugin } from "./types.js";

const plugin: RulePlugin = {
  meta: { name: OXLINT_PLUGIN_NAME },
  rules: {
    [PLUGIN_RULE_IDS.ASYNC_PARALLEL]: asyncParallel,
    [PLUGIN_RULE_IDS.NEXTJS_IMAGE_MISSING_SIZES]: nextjsImageMissingSizes,
    [PLUGIN_RULE_IDS.NEXTJS_LINK_PREFETCH_DEFAULT]: nextjsLinkPrefetchDefault,
    [PLUGIN_RULE_IDS.NEXTJS_NO_CLIENT_FETCH_FOR_SERVER_DATA]:
      nextjsNoClientFetchForServerData,
    [PLUGIN_RULE_IDS.NEXTJS_NO_SIDE_EFFECT_IN_GET_HANDLER]:
      nextjsNoSideEffectInGetHandler,
    [PLUGIN_RULE_IDS.NUXT_CONFIG_SSR_FALSE]: nuxtConfigSsrFalse,
    [PLUGIN_RULE_IDS.NUXT_NO_TOP_LEVEL_AWAIT_IN_SERVER_ROUTE]:
      nuxtNoTopLevelAwaitInServerRoute,
    [PLUGIN_RULE_IDS.SERVER_AFTER_NONBLOCKING]: serverAfterNonblocking,
    [PLUGIN_RULE_IDS.SVELTEKIT_LOAD_SEQUENTIAL_AWAIT]:
      sveltekitLoadSequentialAwait,
    [PLUGIN_RULE_IDS.SVELTEKIT_SERVER_IMPORT_IN_CLIENT_LOAD]:
      sveltekitServerImportInClientLoad,
  },
};

export default plugin;
