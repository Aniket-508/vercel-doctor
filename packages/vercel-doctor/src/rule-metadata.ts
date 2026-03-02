import { getQualifiedPluginRuleId, PLUGIN_RULE_IDS, VERCEL_RULE_IDS } from "./rule-ids.js";
import type { PluginRuleMetadata, RuleCategoryDetails, RuleFixStrategy } from "./types.js";

export const RULE_CATEGORY_NAMES = {
  VERCEL: "Vercel",
  PERFORMANCE: "Performance",
  DEAD_CODE: "Dead Code",
  NEXTJS: "Next.js",
  FUNCTION_DURATION: "Function Duration",
  INVOCATIONS: "Invocations",
  IMAGE_OPTIMIZATION: "Image Optimization",
  CACHING: "Caching",
  OTHER: "Other",
};

export const RULE_CATEGORY_DETAILS: Record<string, RuleCategoryDetails> = {
  [RULE_CATEGORY_NAMES.VERCEL]: {
    description: "Configuration and deployment patterns that affect Vercel billing and performance",
    impact: "May increase function execution time, bandwidth costs, or build times",
  },
  [RULE_CATEGORY_NAMES.PERFORMANCE]: {
    description: "JavaScript/TypeScript code patterns that impact runtime performance",
    impact: "May increase function duration and compute costs",
  },
  [RULE_CATEGORY_NAMES.DEAD_CODE]: {
    description: "Unused files, exports, types, and dependencies",
    impact: "Increases bundle size and cold start times",
  },
  [RULE_CATEGORY_NAMES.NEXTJS]: {
    description: "Next.js-specific patterns affecting caching, rendering, and optimization",
    impact: "May reduce cache hit rates and increase server load",
  },
  [RULE_CATEGORY_NAMES.FUNCTION_DURATION]: {
    description: "Patterns that keep functions running longer than necessary",
    impact: "Increases billed execution time and can slow user responses",
  },
  [RULE_CATEGORY_NAMES.INVOCATIONS]: {
    description: "Patterns that trigger more server work or unnecessary requests",
    impact: "Increases invocation volume and repeated compute costs",
  },
  [RULE_CATEGORY_NAMES.IMAGE_OPTIMIZATION]: {
    description: "Image delivery patterns that affect optimization workload and bandwidth",
    impact: "Can increase image processing usage and asset transfer costs",
  },
  [RULE_CATEGORY_NAMES.CACHING]: {
    description: "Caching and request semantics that affect reuse and cache hit rate",
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
};

const createQualifiedPluginRuleMetadata = (): Record<string, PluginRuleMetadata> => {
  const qualifiedPluginRuleMetadata: Record<string, PluginRuleMetadata> = {};

  for (const [ruleId, ruleMetadata] of Object.entries(PLUGIN_RULE_METADATA)) {
    qualifiedPluginRuleMetadata[getQualifiedPluginRuleId(ruleId)] = ruleMetadata;
  }

  return qualifiedPluginRuleMetadata;
};

export const QUALIFIED_PLUGIN_RULE_METADATA = createQualifiedPluginRuleMetadata();

export const RULE_FIX_STRATEGIES: Record<string, RuleFixStrategy> = {
  [VERCEL_RULE_IDS.NO_FORCE_DYNAMIC]: {
    title: "Replace force-dynamic with revalidate",
    before: "export const dynamic = 'force-dynamic'",
    after: "export const revalidate = 3600 // or use cache: 'force-cache' in fetch",
    explanation:
      "Use incremental static regeneration (ISR) or cacheable fetches instead of forcing dynamic rendering",
  },
  [VERCEL_RULE_IDS.NO_NO_STORE_FETCH]: {
    title: "Add caching to fetch calls",
    before: "fetch(url, { cache: 'no-store' })",
    after: "fetch(url, { cache: 'force-cache', next: { revalidate: 3600 } })",
    explanation:
      "Use cacheable fetches with revalidation instead of no-store for data that doesn't need to be real-time",
  },
  [VERCEL_RULE_IDS.PREFER_GET_STATIC_PROPS]: {
    title: "Convert getServerSideProps to getStaticProps",
    before: "export async function getServerSideProps() { ... }",
    after: "export async function getStaticProps() { ... } // Add revalidate for ISR",
    explanation: "Use static generation with ISR instead of server-side rendering when possible",
  },
  [VERCEL_RULE_IDS.GET_STATIC_PROPS_CONSIDER_ISR]: {
    title: "Add ISR to getStaticProps",
    before: "export async function getStaticProps() { return { props: {} } }",
    after: "export async function getStaticProps() { return { props: {}, revalidate: 3600 } }",
    explanation: "Add revalidation to enable ISR and reduce build times for large sites",
  },
  [VERCEL_RULE_IDS.EDGE_HEAVY_IMPORT]: {
    title: "Move heavy imports to Node runtime",
    before: "import { heavy } from 'heavy-module' // in edge runtime",
    after: "// Move to Node.js runtime handler or use dynamic import",
    explanation: "Heavy modules should run in Node.js runtime, not edge",
  },
  [VERCEL_RULE_IDS.EDGE_SEQUENTIAL_AWAIT]: {
    title: "Parallelize independent awaits",
    before: "const a = await fetchA();\nconst b = await fetchB();",
    after: "const [a, b] = await Promise.all([fetchA(), fetchB()]);",
    explanation: "Use Promise.all() to run independent async operations in parallel",
  },
  [VERCEL_RULE_IDS.MISSING_CACHE_POLICY]: {
    title: "Add Cache-Control headers",
    before: "return Response.json(data)",
    after: "return Response.json(data, { headers: { 'Cache-Control': 's-maxage=3600' } })",
    explanation: "Add explicit cache headers to enable CDN caching for API responses",
  },
  [VERCEL_RULE_IDS.IMAGE_GLOBAL_UNOPTIMIZED]: {
    title: "Enable image optimization",
    before: "images: { unoptimized: true }",
    after: "images: { remotePatterns: [{ hostname: 'example.com' }] }",
    explanation: "Remove unoptimized flag and configure domains for Vercel Image Optimization",
  },
  [VERCEL_RULE_IDS.IMAGE_REMOTE_PATTERN_TOO_BROAD]: {
    title: "Restrict remotePatterns pathname",
    before: "{ hostname: 'cdn.example.com', pathname: '/**' }",
    after: "{ hostname: 'cdn.example.com', pathname: '/images/**' }",
    explanation: "Use specific path patterns instead of broad wildcards to prevent abuse",
  },
  [VERCEL_RULE_IDS.IMAGE_SVG_WITHOUT_UNOPTIMIZED]: {
    title: "Add unoptimized for SVG",
    before: "<Image src='/icon.svg' width={32} height={32} />",
    after: "<Image src='/icon.svg' width={32} height={32} unoptimized />",
    explanation: "SVGs don't benefit from image optimization, so mark them as unoptimized",
  },
  [VERCEL_RULE_IDS.SUGGEST_TURBOPACK_BUILD_CACHE]: {
    title: "Enable Turbopack build cache",
    before: "experimental: { ... }",
    after: "experimental: { turbopackFileSystemCacheForBuild: true }",
    explanation: "Enable Turbopack file system cache to reduce build times (Next.js 16+)",
  },
  [VERCEL_RULE_IDS.SEQUENTIAL_DATABASE_AWAIT]: {
    title: "Parallelize database queries",
    before: "const user = await db.user.findUnique();\nconst posts = await db.post.findMany();",
    after:
      "const [user, posts] = await Promise.all([\n  db.user.findUnique(),\n  db.post.findMany()\n]);",
    explanation: "Use Promise.all() for independent database queries to reduce function duration",
  },
  [VERCEL_RULE_IDS.CONSIDER_BUN_RUNTIME]: {
    title: "Switch to Bun runtime",
    before: "// Using Node.js",
    after: "{ 'packageManager': 'bun@1.x' } // in package.json",
    explanation: "Configure Bun runtime in package.json for faster installs and builds",
  },
  [VERCEL_RULE_IDS.AVOID_PLATFORM_CRON]: {
    title: "Move cron to GitHub Actions or Cloudflare",
    before: "{ 'crons': [{ 'path': '/api/cron', 'schedule': '0 0 * * *' }] }",
    after: "// Use GitHub Actions scheduled workflows instead",
    explanation: "Move scheduled jobs to external services to reduce Vercel function invocations",
  },
  [VERCEL_RULE_IDS.CONSIDER_FLUID_COMPUTE]: {
    title: "Evaluate Fluid Compute",
    before: "// Standard Node.js runtime",
    after: "// Enable Fluid Compute in project settings for variable latency workloads",
    explanation: "Consider Fluid Compute for workloads with variable latency or bursty traffic",
  },
  [VERCEL_RULE_IDS.LARGE_STATIC_ASSET]: {
    title: "Move assets to external CDN",
    before: "// Large files in /public folder",
    after: "// Upload to R2/S3 and serve via CDN",
    explanation: "Move large static assets to external storage to reduce bandwidth costs",
  },
  [VERCEL_RULE_IDS.SUGGEST_DEPLOY_ARCHIVE]: {
    title: "Use archive deployment",
    before: "vercel deploy",
    after: "vercel deploy --archive=tgz",
    explanation: "Use archive deployment for large projects to avoid rate limits",
  },
  [VERCEL_RULE_IDS.MISSING_FUNCTION_TIMEOUT]: {
    title: "Add maxDuration to function config",
    before: `"functions": { "api/*.ts": { "runtime": "nodejs18.x" } }`,
    after: `"functions": { "api/*.ts": { "runtime": "nodejs18.x", "maxDuration": 30 } }`,
    explanation: "Add maxDuration (in seconds) to prevent runaway functions and control costs",
  },
  [PLUGIN_RULE_IDS.ASYNC_PARALLEL]: {
    title: "Parallelize sequential awaits",
    before: "const a = await fetchA();\nconst b = await fetchB();\nconst c = await fetchC();",
    after: "const [a, b, c] = await Promise.all([fetchA(), fetchB(), fetchC()]);",
    explanation: "Run independent async operations in parallel to reduce total execution time",
  },
  [PLUGIN_RULE_IDS.NEXTJS_NO_CLIENT_FETCH_FOR_SERVER_DATA]: {
    title: "Move fetch to server component",
    before: "'use client'\nuseEffect(() => { fetch('/api/data') }, [])",
    after: "// Server component\nconst data = await fetch('/api/data')",
    explanation: "Fetch data in server components instead of client-side useEffect",
  },
  [PLUGIN_RULE_IDS.NEXTJS_LINK_PREFETCH_DEFAULT]: {
    title: "Disable default prefetch",
    before: "<Link href='/page'>Page</Link>",
    after: "<Link href='/page' prefetch={false}>Page</Link>",
    explanation: "Disable prefetch for non-critical links to reduce function invocations",
  },
  [PLUGIN_RULE_IDS.NEXTJS_IMAGE_MISSING_SIZES]: {
    title: "Add sizes prop to Image",
    before: "<Image src='...' fill />",
    after: "<Image src='...' fill sizes='(max-width: 768px) 100vw, 50vw' />",
    explanation: "Add sizes attribute for responsive images to optimize download size",
  },
  [PLUGIN_RULE_IDS.NEXTJS_NO_SIDE_EFFECT_IN_GET_HANDLER]: {
    title: "Move side effects to POST handler",
    before: "export async function GET() { await db.update(); return Response.json({}) }",
    after: "export async function POST() { await db.update(); return Response.json({}) }",
    explanation: "Use POST for mutations to prevent CSRF and unintended prefetch triggers",
  },
  [PLUGIN_RULE_IDS.SERVER_AFTER_NONBLOCKING]: {
    title: "Wrap logging in after()",
    before: "console.log('done'); analytics.track(event);",
    after: "after(() => { console.log('done'); analytics.track(event); });",
    explanation: "Use after() to run non-critical work after response is sent",
  },
};
