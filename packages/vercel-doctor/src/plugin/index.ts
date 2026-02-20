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
  meta: { name: "vercel-doctor" },
  rules: {
    "nextjs-no-client-fetch-for-server-data": nextjsNoClientFetchForServerData,
    "nextjs-image-missing-sizes": nextjsImageMissingSizes,
    "nextjs-link-prefetch-default": nextjsLinkPrefetchDefault,
    "nextjs-no-side-effect-in-get-handler": nextjsNoSideEffectInGetHandler,

    "server-after-nonblocking": serverAfterNonblocking,

    "async-parallel": asyncParallel,
  },
};

export default plugin;
