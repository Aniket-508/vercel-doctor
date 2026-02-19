import { asyncParallel } from "./rules/js-performance.js";
import {
  nextjsImageMissingSizes,
  nextjsNoClientFetchForServerData,
  nextjsNoImgElement,
  nextjsNoSideEffectInGetHandler,
} from "./rules/nextjs.js";
import { serverAfterNonblocking } from "./rules/server.js";
import type { RulePlugin } from "./types.js";

const plugin: RulePlugin = {
  meta: { name: "vercel-doctor" },
  rules: {
    "nextjs-no-img-element": nextjsNoImgElement,
    "nextjs-no-client-fetch-for-server-data": nextjsNoClientFetchForServerData,
    "nextjs-image-missing-sizes": nextjsImageMissingSizes,
    "nextjs-no-side-effect-in-get-handler": nextjsNoSideEffectInGetHandler,

    "server-after-nonblocking": serverAfterNonblocking,

    "async-parallel": asyncParallel,
  },
};

export default plugin;
