import { OXLINT_PLUGIN_NAME, PLUGIN_RULE_IDS } from "../rule-ids.js";
import { asyncParallel } from "./rules/js-performance.js";
import {
  nextjsImageMissingSizes,
  nextjsLinkPrefetchDefault,
  nextjsNoClientFetchForServerData,
  nextjsNoSideEffectInGetHandler,
} from "./rules/nextjs.js";
import { serverAfterNonblocking } from "./rules/server.js";
import type { RulePlugin } from "./types.js";

const plugin: RulePlugin = {
  meta: { name: OXLINT_PLUGIN_NAME },
  rules: {
    [PLUGIN_RULE_IDS.NEXTJS_NO_CLIENT_FETCH_FOR_SERVER_DATA]: nextjsNoClientFetchForServerData,
    [PLUGIN_RULE_IDS.NEXTJS_IMAGE_MISSING_SIZES]: nextjsImageMissingSizes,
    [PLUGIN_RULE_IDS.NEXTJS_LINK_PREFETCH_DEFAULT]: nextjsLinkPrefetchDefault,
    [PLUGIN_RULE_IDS.NEXTJS_NO_SIDE_EFFECT_IN_GET_HANDLER]: nextjsNoSideEffectInGetHandler,
    [PLUGIN_RULE_IDS.SERVER_AFTER_NONBLOCKING]: serverAfterNonblocking,
    [PLUGIN_RULE_IDS.ASYNC_PARALLEL]: asyncParallel,
  },
};

export default plugin;
