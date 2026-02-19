import {
  noBarrelImport,
  noFullLodashImport,
  noMoment,
  noUndeferredThirdParty,
  preferDynamicImport,
  useLazyMotion,
} from "./rules/bundle-size.js";
import { asyncParallel } from "./rules/js-performance.js";
import {
  nextjsAsyncClientComponent,
  nextjsImageMissingSizes,
  nextjsInlineScriptMissingId,
  nextjsMissingMetadata,
  nextjsNoAElement,
  nextjsNoClientFetchForServerData,
  nextjsNoClientSideRedirect,
  nextjsNoCssLink,
  nextjsNoFontLink,
  nextjsNoHeadImport,
  nextjsNoImgElement,
  nextjsNoLinkElementForExternal,
  nextjsNoNativeScript,
  nextjsNoPolyfillScript,
  nextjsNoRedirectInTryCatch,
  nextjsNoSideEffectInGetHandler,
  nextjsNoUseSearchParamsWithoutSuspense,
} from "./rules/nextjs.js";
import { serverAfterNonblocking, serverAuthActions } from "./rules/server.js";
import type { RulePlugin } from "./types.js";

const plugin: RulePlugin = {
  meta: { name: "vercel-doctor" },
  rules: {
    "no-barrel-import": noBarrelImport,
    "no-full-lodash-import": noFullLodashImport,
    "no-moment": noMoment,
    "prefer-dynamic-import": preferDynamicImport,
    "use-lazy-motion": useLazyMotion,
    "no-undeferred-third-party": noUndeferredThirdParty,

    "nextjs-no-img-element": nextjsNoImgElement,
    "nextjs-async-client-component": nextjsAsyncClientComponent,
    "nextjs-no-a-element": nextjsNoAElement,
    "nextjs-no-use-search-params-without-suspense": nextjsNoUseSearchParamsWithoutSuspense,
    "nextjs-no-client-fetch-for-server-data": nextjsNoClientFetchForServerData,
    "nextjs-missing-metadata": nextjsMissingMetadata,
    "nextjs-no-client-side-redirect": nextjsNoClientSideRedirect,
    "nextjs-no-redirect-in-try-catch": nextjsNoRedirectInTryCatch,
    "nextjs-image-missing-sizes": nextjsImageMissingSizes,
    "nextjs-no-native-script": nextjsNoNativeScript,
    "nextjs-inline-script-missing-id": nextjsInlineScriptMissingId,
    "nextjs-no-font-link": nextjsNoFontLink,
    "nextjs-no-css-link": nextjsNoCssLink,
    "nextjs-no-polyfill-script": nextjsNoPolyfillScript,
    "nextjs-no-head-import": nextjsNoHeadImport,
    "nextjs-no-side-effect-in-get-handler": nextjsNoSideEffectInGetHandler,
    "nextjs-no-link-element-for-external": nextjsNoLinkElementForExternal,

    "server-auth-actions": serverAuthActions,
    "server-after-nonblocking": serverAfterNonblocking,

    "async-parallel": asyncParallel,
  },
};

export default plugin;
