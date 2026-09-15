import { NEXT_MAJOR_VERSION_15, NEXT_MAJOR_VERSION_16 } from "../constants.js";
import type { ProjectInfo } from "../types.js";

const getNextVersionCostGuidance = (projectInfo: ProjectInfo): string[] => {
  if (
    projectInfo.nextMajorVersion !== null &&
    projectInfo.nextMajorVersion >= NEXT_MAJOR_VERSION_16
  ) {
    return [
      `Next.js ${NEXT_MAJOR_VERSION_16}+ detected: prefer "use cache" with cache tags for shared reads to cut uncached function work.`,
      "Keep Proxy usage narrow with strict matcher patterns so every request is not billed dynamic compute.",
    ];
  }

  if (projectInfo.nextMajorVersion === NEXT_MAJOR_VERSION_15) {
    return [
      `Next.js ${NEXT_MAJOR_VERSION_15} detected: fetch and GET handlers are uncached by default, so explicitly add cache policies.`,
      "Prioritize cacheable fetches with revalidate windows before introducing force-dynamic rendering.",
    ];
  }

  if (projectInfo.nextMajorVersion !== null) {
    return [
      "Older Next.js version detected: verify force-dynamic and no-store are only used for truly request-specific data.",
    ];
  }

  return [
    "Next.js detected but version was not parsed. Set an explicit next semver range to unlock version-aware cost guidance.",
  ];
};

const getNuxtCostGuidance = (_projectInfo: ProjectInfo): string[] => [
  "Use `routeRules` in nuxt.config.ts to set SWR/ISR caching for frequently accessed routes.",
  "Enable SSR (default) for optimal Vercel edge rendering performance.",
  "Use `useFetch()` or `useAsyncData()` instead of raw `$fetch()` for SSR-compatible data fetching.",
];

const getSvelteKitCostGuidance = (_projectInfo: ProjectInfo): string[] => [
  "Enable `split: true` in adapter-vercel options for smaller, faster serverless functions.",
  "Add `export const prerender = true` to static pages to reduce function invocations.",
  "Use SvelteKit's `load` functions for server-side data loading instead of client-side fetching.",
];

export const getVersionCostGuidance = (projectInfo: ProjectInfo): string[] => {
  switch (projectInfo.framework) {
    case "nextjs": {
      return getNextVersionCostGuidance(projectInfo);
    }
    case "nuxt": {
      return getNuxtCostGuidance(projectInfo);
    }
    case "sveltekit": {
      return getSvelteKitCostGuidance(projectInfo);
    }
    default: {
      return [];
    }
  }
};
