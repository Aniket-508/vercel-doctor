import type { Framework } from "./types.js";

const NEXTJS_RULES: Record<string, string> = {
  "vercel-doctor/nextjs-no-client-fetch-for-server-data": "warn",
  "vercel-doctor/nextjs-image-missing-sizes": "warn",
  "vercel-doctor/nextjs-link-prefetch-default": "warn",
  "vercel-doctor/nextjs-no-side-effect-in-get-handler": "error",
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
    "vercel-doctor/server-after-nonblocking": "warn",

    "vercel-doctor/async-parallel": "warn",
    ...(framework === "nextjs" ? NEXTJS_RULES : {}),
  },
});
