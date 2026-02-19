import type { Framework } from "./types.js";

const NEXTJS_RULES: Record<string, string> = {
  "vercel-doctor/nextjs-no-img-element": "warn",
  "vercel-doctor/nextjs-async-client-component": "error",
  "vercel-doctor/nextjs-no-a-element": "warn",
  "vercel-doctor/nextjs-no-use-search-params-without-suspense": "warn",
  "vercel-doctor/nextjs-no-client-fetch-for-server-data": "warn",
  "vercel-doctor/nextjs-missing-metadata": "warn",
  "vercel-doctor/nextjs-no-client-side-redirect": "warn",
  "vercel-doctor/nextjs-no-redirect-in-try-catch": "warn",
  "vercel-doctor/nextjs-image-missing-sizes": "warn",
  "vercel-doctor/nextjs-no-native-script": "warn",
  "vercel-doctor/nextjs-inline-script-missing-id": "warn",
  "vercel-doctor/nextjs-no-font-link": "warn",
  "vercel-doctor/nextjs-no-css-link": "warn",
  "vercel-doctor/nextjs-no-polyfill-script": "warn",
  "vercel-doctor/nextjs-no-head-import": "error",
  "vercel-doctor/nextjs-no-side-effect-in-get-handler": "error",
  "vercel-doctor/nextjs-no-link-element-for-external": "warn",
};

interface OxlintConfigOptions {
  pluginPath: string;
  framework: Framework;
}

export const createOxlintConfig = ({ pluginPath, framework }: OxlintConfigOptions) => ({
  categories: {
    correctness: "off",
    suspicious: "off",
    pedantic: "off",
    perf: "off",
    restriction: "off",
    style: "off",
    nursery: "off",
  },
  plugins: [],
  jsPlugins: [pluginPath],
  rules: {
    "vercel-doctor/no-barrel-import": "warn",
    "vercel-doctor/no-full-lodash-import": "warn",
    "vercel-doctor/no-moment": "warn",
    "vercel-doctor/prefer-dynamic-import": "warn",
    "vercel-doctor/use-lazy-motion": "warn",
    "vercel-doctor/no-undeferred-third-party": "warn",

    "vercel-doctor/server-auth-actions": "error",
    "vercel-doctor/server-after-nonblocking": "warn",

    "vercel-doctor/async-parallel": "warn",
    ...(framework === "nextjs" ? NEXTJS_RULES : {}),
  },
});
