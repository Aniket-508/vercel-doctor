import {
  getQualifiedPluginRuleId,
  PLUGIN_RULE_IDS,
  VERCEL_RULE_IDS,
} from "./rule-ids.js";
import type {
  PluginRuleMetadata,
  RuleCategoryDetails,
  RuleFixStrategy,
} from "./types.js";

export const RULE_CATEGORY_NAMES = {
  CACHING: "Caching",
  DEAD_CODE: "Dead Code",
  FUNCTION_DURATION: "Function Duration",
  IMAGE_OPTIMIZATION: "Image Optimization",
  INVOCATIONS: "Invocations",
  NEXTJS: "Next.js",
  OTHER: "Other",
  PERFORMANCE: "Performance",
  VERCEL: "Vercel",
};

export const RULE_CATEGORY_DETAILS: Record<string, RuleCategoryDetails> = {
  [RULE_CATEGORY_NAMES.VERCEL]: {
    description:
      "Configuration and deployment patterns that affect Vercel billing and performance",
    impact:
      "May increase function execution time, bandwidth costs, or build times",
  },
  [RULE_CATEGORY_NAMES.PERFORMANCE]: {
    description:
      "JavaScript/TypeScript code patterns that impact runtime performance",
    impact: "May increase function duration and compute costs",
  },
  [RULE_CATEGORY_NAMES.DEAD_CODE]: {
    description: "Unused files, exports, types, and dependencies",
    impact: "Increases bundle size and cold start times",
  },
  [RULE_CATEGORY_NAMES.NEXTJS]: {
    description:
      "Next.js-specific patterns affecting caching, rendering, and optimization",
    impact: "May reduce cache hit rates and increase server load",
  },
  [RULE_CATEGORY_NAMES.FUNCTION_DURATION]: {
    description: "Patterns that keep functions running longer than necessary",
    impact: "Increases billed execution time and can slow user responses",
  },
  [RULE_CATEGORY_NAMES.INVOCATIONS]: {
    description:
      "Patterns that trigger more server work or unnecessary requests",
    impact: "Increases invocation volume and repeated compute costs",
  },
  [RULE_CATEGORY_NAMES.IMAGE_OPTIMIZATION]: {
    description:
      "Image delivery patterns that affect optimization workload and bandwidth",
    impact: "Can increase image processing usage and asset transfer costs",
  },
  [RULE_CATEGORY_NAMES.CACHING]: {
    description:
      "Caching and request semantics that affect reuse and cache hit rate",
    impact: "Reduces cache effectiveness and increases uncached origin work",
  },
  [RULE_CATEGORY_NAMES.OTHER]: {
    description: "General code quality issues",
    impact: "May affect performance or maintainability",
  },
};

export const PLUGIN_RULE_METADATA: Record<string, PluginRuleMetadata> = {
  [PLUGIN_RULE_IDS.NEXTJS_NO_CLIENT_FETCH_FOR_SERVER_DATA]: {
    category: RULE_CATEGORY_NAMES.INVOCATIONS,
    help: "Remove 'use client' and fetch directly in the Server Component — no API round-trip, secrets stay on server",
    severity: "warn",
  },
  [PLUGIN_RULE_IDS.NEXTJS_IMAGE_MISSING_SIZES]: {
    category: RULE_CATEGORY_NAMES.IMAGE_OPTIMIZATION,
    help: 'Add sizes for responsive behavior: `sizes="(max-width: 768px) 100vw, 50vw"` matching your layout breakpoints',
    severity: "warn",
  },
  [PLUGIN_RULE_IDS.NEXTJS_LINK_PREFETCH_DEFAULT]: {
    category: RULE_CATEGORY_NAMES.INVOCATIONS,
    help: "Add prefetch={false} to Link, or disable globally in next.config. Add prefetch={true} only to critical links — reduces compute",
    severity: "warn",
  },
  [PLUGIN_RULE_IDS.NEXTJS_NO_SIDE_EFFECT_IN_GET_HANDLER]: {
    category: RULE_CATEGORY_NAMES.CACHING,
    help: "Move the side effect to a POST handler and use a <form> or fetch with method POST — GET requests can be triggered by prefetching and are vulnerable to CSRF",
    severity: "error",
  },
  [PLUGIN_RULE_IDS.SERVER_AFTER_NONBLOCKING]: {
    category: RULE_CATEGORY_NAMES.FUNCTION_DURATION,
    help: "`import { after } from 'next/server'` then wrap: `after(() => analytics.track(...))` — response isn't blocked",
    severity: "warn",
  },
  [PLUGIN_RULE_IDS.ASYNC_PARALLEL]: {
    category: RULE_CATEGORY_NAMES.FUNCTION_DURATION,
    help: "Use `const [a, b] = await Promise.all([fetchA(), fetchB()])` to run independent operations concurrently",
    severity: "warn",
  },
  [PLUGIN_RULE_IDS.NUXT_CONFIG_SSR_FALSE]: {
    category: RULE_CATEGORY_NAMES.VERCEL,
    help: "Enable SSR (remove `ssr: false`) for optimal Vercel deployment with edge rendering",
    severity: "warn",
  },
  [PLUGIN_RULE_IDS.NUXT_NO_TOP_LEVEL_AWAIT_IN_SERVER_ROUTE]: {
    category: RULE_CATEGORY_NAMES.FUNCTION_DURATION,
    help: "Use `Promise.all()` for independent async operations in Nitro server route handlers",
    severity: "warn",
  },
  [PLUGIN_RULE_IDS.SVELTEKIT_LOAD_SEQUENTIAL_AWAIT]: {
    category: RULE_CATEGORY_NAMES.FUNCTION_DURATION,
    help: "Use `Promise.all()` for independent async operations in SvelteKit load functions",
    severity: "warn",
  },
  [PLUGIN_RULE_IDS.SVELTEKIT_SERVER_IMPORT_IN_CLIENT_LOAD]: {
    category: RULE_CATEGORY_NAMES.CACHING,
    help: "Move server-only imports to `+page.server.ts` to avoid shipping server code to the client bundle",
    severity: "error",
  },
};

const createQualifiedPluginRuleMetadata = (): Record<
  string,
  PluginRuleMetadata
> => {
  const qualifiedPluginRuleMetadata: Record<string, PluginRuleMetadata> = {};

  for (const [ruleId, ruleMetadata] of Object.entries(PLUGIN_RULE_METADATA)) {
    qualifiedPluginRuleMetadata[getQualifiedPluginRuleId(ruleId)] =
      ruleMetadata;
  }

  return qualifiedPluginRuleMetadata;
};

export const QUALIFIED_PLUGIN_RULE_METADATA =
  createQualifiedPluginRuleMetadata();

export const RULE_FIX_STRATEGIES: Record<string, RuleFixStrategy> = {
  [VERCEL_RULE_IDS.NO_FORCE_DYNAMIC]: {
    after:
      "export const revalidate = 3600 // or use cache: 'force-cache' in fetch",
    before: "export const dynamic = 'force-dynamic'",
    explanation:
      "Use incremental static regeneration (ISR) or cacheable fetches instead of forcing dynamic rendering",
    title: "Replace force-dynamic with revalidate",
  },
  [VERCEL_RULE_IDS.NO_NO_STORE_FETCH]: {
    after: "fetch(url, { cache: 'force-cache', next: { revalidate: 3600 } })",
    before: "fetch(url, { cache: 'no-store' })",
    explanation:
      "Use cacheable fetches with revalidation instead of no-store for data that doesn't need to be real-time",
    title: "Add caching to fetch calls",
  },
  [VERCEL_RULE_IDS.PREFER_GET_STATIC_PROPS]: {
    after:
      "export async function getStaticProps() { ... } // Add revalidate for ISR",
    before: "export async function getServerSideProps() { ... }",
    explanation:
      "Use static generation with ISR instead of server-side rendering when possible",
    title: "Convert getServerSideProps to getStaticProps",
  },
  [VERCEL_RULE_IDS.GET_STATIC_PROPS_CONSIDER_ISR]: {
    after:
      "export async function getStaticProps() { return { props: {}, revalidate: 3600 } }",
    before: "export async function getStaticProps() { return { props: {} } }",
    explanation:
      "Add revalidation to enable ISR and reduce build times for large sites",
    title: "Add ISR to getStaticProps",
  },
  [VERCEL_RULE_IDS.EDGE_HEAVY_IMPORT]: {
    after: "// Move to Node.js runtime handler or use dynamic import",
    before: "import { heavy } from 'heavy-module' // in edge runtime",
    explanation: "Heavy modules should run in Node.js runtime, not edge",
    title: "Move heavy imports to Node runtime",
  },
  [VERCEL_RULE_IDS.EDGE_SEQUENTIAL_AWAIT]: {
    after: "const [a, b] = await Promise.all([fetchA(), fetchB()]);",
    before: "const a = await fetchA();\nconst b = await fetchB();",
    explanation:
      "Use Promise.all() to run independent async operations in parallel",
    title: "Parallelize independent awaits",
  },
  [VERCEL_RULE_IDS.MISSING_CACHE_POLICY]: {
    after:
      "return Response.json(data, { headers: { 'Cache-Control': 's-maxage=3600' } })",
    before: "return Response.json(data)",
    explanation:
      "Add explicit cache headers to enable CDN caching for API responses",
    title: "Add Cache-Control headers",
  },
  [VERCEL_RULE_IDS.IMAGE_GLOBAL_UNOPTIMIZED]: {
    after: "images: { remotePatterns: [{ hostname: 'example.com' }] }",
    before: "images: { unoptimized: true }",
    explanation:
      "Remove unoptimized flag and configure domains for Vercel Image Optimization",
    title: "Enable image optimization",
  },
  [VERCEL_RULE_IDS.IMAGE_REMOTE_PATTERN_TOO_BROAD]: {
    after: "{ hostname: 'cdn.example.com', pathname: '/images/**' }",
    before: "{ hostname: 'cdn.example.com', pathname: '/**' }",
    explanation:
      "Use specific path patterns instead of broad wildcards to prevent abuse",
    title: "Restrict remotePatterns pathname",
  },
  [VERCEL_RULE_IDS.SUGGEST_TURBOPACK_BUILD_CACHE]: {
    after: "experimental: { turbopackFileSystemCacheForBuild: true }",
    before: "experimental: { ... }",
    explanation:
      "Enable Turbopack file system cache to reduce build times (Next.js 16+)",
    title: "Enable Turbopack build cache",
  },
  [VERCEL_RULE_IDS.SEQUENTIAL_DATABASE_AWAIT]: {
    after:
      "const [user, posts] = await Promise.all([\n  db.user.findUnique(),\n  db.post.findMany()\n]);",
    before:
      "const user = await db.user.findUnique();\nconst posts = await db.post.findMany();",
    explanation:
      "Use Promise.all() for independent database queries to reduce function duration",
    title: "Parallelize database queries",
  },
  [VERCEL_RULE_IDS.CONSIDER_BUN_RUNTIME]: {
    after: "{ 'packageManager': 'bun@1.x' } // in package.json",
    before: "// Using Node.js",
    explanation:
      "Configure Bun runtime in package.json for faster installs and builds",
    title: "Switch to Bun runtime",
  },
  [VERCEL_RULE_IDS.AVOID_PLATFORM_CRON]: {
    after: "// Use GitHub Actions scheduled workflows instead",
    before: "{ 'crons': [{ 'path': '/api/cron', 'schedule': '0 0 * * *' }] }",
    explanation:
      "Move scheduled jobs to external services to reduce Vercel function invocations",
    title: "Move cron to GitHub Actions or Cloudflare",
  },
  [VERCEL_RULE_IDS.CONSIDER_FLUID_COMPUTE]: {
    after:
      "// Enable Fluid Compute in project settings for variable latency workloads",
    before: "// Standard Node.js runtime",
    explanation:
      "Consider Fluid Compute for workloads with variable latency or bursty traffic",
    title: "Evaluate Fluid Compute",
  },
  [VERCEL_RULE_IDS.LARGE_STATIC_ASSET]: {
    after: "// Upload to R2/S3 and serve via CDN",
    before: "// Large files in /public folder",
    explanation:
      "Move large static assets to external storage to reduce bandwidth costs",
    title: "Move assets to external CDN",
  },
  [VERCEL_RULE_IDS.SUGGEST_DEPLOY_ARCHIVE]: {
    after: "vercel deploy --archive=tgz",
    before: "vercel deploy",
    explanation:
      "Use archive deployment for large projects to avoid rate limits",
    title: "Use archive deployment",
  },
  [VERCEL_RULE_IDS.MISSING_FUNCTION_TIMEOUT]: {
    after: `"functions": { "api/*.ts": { "runtime": "nodejs18.x", "maxDuration": 30 } }`,
    before: `"functions": { "api/*.ts": { "runtime": "nodejs18.x" } }`,
    explanation:
      "Add maxDuration (in seconds) to prevent runaway functions and control costs",
    title: "Add maxDuration to function config",
  },
  [PLUGIN_RULE_IDS.ASYNC_PARALLEL]: {
    after:
      "const [a, b, c] = await Promise.all([fetchA(), fetchB(), fetchC()]);",
    before:
      "const a = await fetchA();\nconst b = await fetchB();\nconst c = await fetchC();",
    explanation:
      "Run independent async operations in parallel to reduce total execution time",
    title: "Parallelize sequential awaits",
  },
  [PLUGIN_RULE_IDS.NEXTJS_NO_CLIENT_FETCH_FOR_SERVER_DATA]: {
    after: "// Server component\nconst data = await fetch('/api/data')",
    before: "'use client'\nuseEffect(() => { fetch('/api/data') }, [])",
    explanation:
      "Fetch data in server components instead of client-side useEffect",
    title: "Move fetch to server component",
  },
  [PLUGIN_RULE_IDS.NEXTJS_LINK_PREFETCH_DEFAULT]: {
    after: "<Link href='/page' prefetch={false}>Page</Link>",
    before: "<Link href='/page'>Page</Link>",
    explanation:
      "Disable prefetch for non-critical links to reduce function invocations",
    title: "Disable default prefetch",
  },
  [PLUGIN_RULE_IDS.NEXTJS_IMAGE_MISSING_SIZES]: {
    after: "<Image src='...' fill sizes='(max-width: 768px) 100vw, 50vw' />",
    before: "<Image src='...' fill />",
    explanation:
      "Add sizes attribute for responsive images to optimize download size",
    title: "Add sizes prop to Image",
  },
  [PLUGIN_RULE_IDS.NEXTJS_NO_SIDE_EFFECT_IN_GET_HANDLER]: {
    after:
      "export async function POST() { await db.update(); return Response.json({}) }",
    before:
      "export async function GET() { await db.update(); return Response.json({}) }",
    explanation:
      "Use POST for mutations to prevent CSRF and unintended prefetch triggers",
    title: "Move side effects to POST handler",
  },
  [PLUGIN_RULE_IDS.SERVER_AFTER_NONBLOCKING]: {
    after: "after(() => { console.log('done'); analytics.track(event); });",
    before: "console.log('done'); analytics.track(event);",
    explanation: "Use after() to run non-critical work after response is sent",
    title: "Wrap logging in after()",
  },
  [PLUGIN_RULE_IDS.NUXT_CONFIG_SSR_FALSE]: {
    after: "export default defineNuxtConfig({ /* remove ssr: false */ })",
    before: "export default defineNuxtConfig({ ssr: false })",
    explanation: "Enable SSR for optimal Vercel edge rendering and performance",
    title: "Enable SSR in Nuxt config",
  },
  [PLUGIN_RULE_IDS.NUXT_NO_TOP_LEVEL_AWAIT_IN_SERVER_ROUTE]: {
    after:
      "const [users, posts] = await Promise.all([\n  getUsers(),\n  getPosts()\n]);",
    before: "const users = await getUsers();\nconst posts = await getPosts();",
    explanation:
      "Use Promise.all() for independent async operations in Nitro server routes",
    title: "Parallelize Nitro server route awaits",
  },
  [PLUGIN_RULE_IDS.SVELTEKIT_LOAD_SEQUENTIAL_AWAIT]: {
    after:
      "const [a, b] = await Promise.all([\n  fetch(url1).then(r => r.json()),\n  fetch(url2).then(r => r.json())\n]);",
    before:
      "const a = await fetch(url1).then(r => r.json());\nconst b = await fetch(url2).then(r => r.json());",
    explanation:
      "Use Promise.all() for independent async operations in SvelteKit load functions",
    title: "Parallelize SvelteKit load awaits",
  },
  [PLUGIN_RULE_IDS.SVELTEKIT_SERVER_IMPORT_IN_CLIENT_LOAD]: {
    after: "// +page.server.ts\nimport { db } from '$lib/server/database';",
    before: "// +page.ts\nimport { db } from '$lib/server/database';",
    explanation:
      "Move server-only imports to +page.server.ts to avoid shipping server code to the client",
    title: "Move server import to server load",
  },
};
