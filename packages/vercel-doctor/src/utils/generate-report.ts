import type { Diagnostic } from "../types.js";

export interface ReportSection {
  title: string;
  diagnostics: Diagnostic[];
  description: string;
  impact: string;
}

export interface FixSuggestion {
  title: string;
  before: string;
  after: string;
  explanation: string;
}

export interface AIPromptContext {
  rule: string;
  issue: string;
  filePath: string;
  line: number;
  severity: "error" | "warning";
  fixStrategy: string;
}

const CATEGORY_DESCRIPTIONS: Record<string, { description: string; impact: string }> = {
  Vercel: {
    description: "Configuration and deployment patterns that affect Vercel billing and performance",
    impact: "May increase function execution time, bandwidth costs, or build times",
  },
  Performance: {
    description: "JavaScript/TypeScript code patterns that impact runtime performance",
    impact: "May increase function duration and compute costs",
  },
  "Dead Code": {
    description: "Unused files, exports, types, and dependencies",
    impact: "Increases bundle size and cold start times",
  },
  "Next.js": {
    description: "Next.js-specific patterns affecting caching, rendering, and optimization",
    impact: "May reduce cache hit rates and increase server load",
  },
};

// Exported so tests can verify these keys stay in sync with registered rule names (#5)
export const RULE_FIX_STRATEGIES: Record<string, FixSuggestion> = {
  "vercel-no-force-dynamic": {
    title: "Replace force-dynamic with revalidate",
    before: "export const dynamic = 'force-dynamic'",
    after: "export const revalidate = 3600 // or use cache: 'force-cache' in fetch",
    explanation:
      "Use incremental static regeneration (ISR) or cacheable fetches instead of forcing dynamic rendering",
  },
  "vercel-no-no-store-fetch": {
    title: "Add caching to fetch calls",
    before: "fetch(url, { cache: 'no-store' })",
    after: "fetch(url, { cache: 'force-cache', next: { revalidate: 3600 } })",
    explanation:
      "Use cacheable fetches with revalidation instead of no-store for data that doesn't need to be real-time",
  },
  "vercel-prefer-get-static-props": {
    title: "Convert getServerSideProps to getStaticProps",
    before: "export async function getServerSideProps() { ... }",
    after: "export async function getStaticProps() { ... } // Add revalidate for ISR",
    explanation: "Use static generation with ISR instead of server-side rendering when possible",
  },
  "vercel-get-static-props-consider-isr": {
    title: "Add ISR to getStaticProps",
    before: "export async function getStaticProps() { return { props: {} } }",
    after: "export async function getStaticProps() { return { props: {}, revalidate: 3600 } }",
    explanation: "Add revalidation to enable ISR and reduce build times for large sites",
  },
  "vercel-edge-heavy-import": {
    title: "Move heavy imports to Node runtime",
    before: "import { heavy } from 'heavy-module' // in edge runtime",
    after: "// Move to Node.js runtime handler or use dynamic import",
    explanation: "Heavy modules should run in Node.js runtime, not edge",
  },
  "vercel-edge-sequential-await": {
    title: "Parallelize independent awaits",
    before: "const a = await fetchA();\nconst b = await fetchB();",
    after: "const [a, b] = await Promise.all([fetchA(), fetchB()]);",
    explanation: "Use Promise.all() to run independent async operations in parallel",
  },
  "vercel-missing-cache-policy": {
    title: "Add Cache-Control headers",
    before: "return Response.json(data)",
    after: "return Response.json(data, { headers: { 'Cache-Control': 's-maxage=3600' } })",
    explanation: "Add explicit cache headers to enable CDN caching for API responses",
  },
  "vercel-image-global-unoptimized": {
    title: "Enable image optimization",
    before: "images: { unoptimized: true }",
    after: "images: { remotePatterns: [{ hostname: 'example.com' }] }",
    explanation: "Remove unoptimized flag and configure domains for Vercel Image Optimization",
  },
  "vercel-image-remote-pattern-too-broad": {
    title: "Restrict remotePatterns pathname",
    before: "{ hostname: 'cdn.example.com', pathname: '/**' }",
    after: "{ hostname: 'cdn.example.com', pathname: '/images/**' }",
    explanation: "Use specific path patterns instead of broad wildcards to prevent abuse",
  },
  "vercel-image-svg-without-unoptimized": {
    title: "Add unoptimized for SVG",
    before: "<Image src='/icon.svg' width={32} height={32} />",
    after: "<Image src='/icon.svg' width={32} height={32} unoptimized />",
    explanation: "SVGs don't benefit from image optimization, so mark them as unoptimized",
  },
  "vercel-suggest-turbopack-build-cache": {
    title: "Enable Turbopack build cache",
    before: "experimental: { ... }",
    after: "experimental: { turbopackFileSystemCacheForBuild: true }",
    explanation: "Enable Turbopack file system cache to reduce build times (Next.js 16+)",
  },
  "vercel-sequential-database-await": {
    title: "Parallelize database queries",
    before: "const user = await db.user.findUnique();\nconst posts = await db.post.findMany();",
    after:
      "const [user, posts] = await Promise.all([\n  db.user.findUnique(),\n  db.post.findMany()\n]);",
    explanation: "Use Promise.all() for independent database queries to reduce function duration",
  },
  "vercel-consider-bun-runtime": {
    title: "Switch to Bun runtime",
    before: "// Using Node.js",
    after: "{ 'packageManager': 'bun@1.x' } // in package.json",
    explanation: "Configure Bun runtime in package.json for faster installs and builds",
  },
  "vercel-avoid-platform-cron": {
    title: "Move cron to GitHub Actions or Cloudflare",
    before: "{ 'crons': [{ 'path': '/api/cron', 'schedule': '0 0 * * *' }] }",
    after: "// Use GitHub Actions scheduled workflows instead",
    explanation: "Move scheduled jobs to external services to reduce Vercel function invocations",
  },
  "vercel-consider-fluid-compute": {
    title: "Evaluate Fluid Compute",
    before: "// Standard Node.js runtime",
    after: "// Enable Fluid Compute in project settings for variable latency workloads",
    explanation: "Consider Fluid Compute for workloads with variable latency or bursty traffic",
  },
  "vercel-large-static-asset": {
    title: "Move assets to external CDN",
    before: "// Large files in /public folder",
    after: "// Upload to R2/S3 and serve via CDN",
    explanation: "Move large static assets to external storage to reduce bandwidth costs",
  },
  "vercel-suggest-deploy-archive": {
    title: "Use archive deployment",
    before: "vercel deploy",
    after: "vercel deploy --archive=tgz",
    explanation: "Use archive deployment for large projects to avoid rate limits",
  },
  "vercel-missing-function-timeout": {
    title: "Add maxDuration to function config",
    before: `"functions": { "api/*.ts": { "runtime": "nodejs18.x" } }`,
    after: `"functions": { "api/*.ts": { "runtime": "nodejs18.x", "maxDuration": 30 } }`,
    explanation: "Add maxDuration (in seconds) to prevent runaway functions and control costs",
  },
  "async-parallel": {
    title: "Parallelize sequential awaits",
    before: "const a = await fetchA();\nconst b = await fetchB();\nconst c = await fetchC();",
    after: "const [a, b, c] = await Promise.all([fetchA(), fetchB(), fetchC()]);",
    explanation: "Run independent async operations in parallel to reduce total execution time",
  },
  "nextjs-no-client-fetch-for-server-data": {
    title: "Move fetch to server component",
    before: "'use client'\nuseEffect(() => { fetch('/api/data') }, [])",
    after: "// Server component\nconst data = await fetch('/api/data')",
    explanation: "Fetch data in server components instead of client-side useEffect",
  },
  "nextjs-link-prefetch-default": {
    title: "Disable default prefetch",
    before: "<Link href='/page'>Page</Link>",
    after: "<Link href='/page' prefetch={false}>Page</Link>",
    explanation: "Disable prefetch for non-critical links to reduce function invocations",
  },
  "nextjs-image-missing-sizes": {
    title: "Add sizes prop to Image",
    before: "<Image src='...' fill />",
    after: "<Image src='...' fill sizes='(max-width: 768px) 100vw, 50vw' />",
    explanation: "Add sizes attribute for responsive images to optimize download size",
  },
  "nextjs-no-side-effect-in-get-handler": {
    title: "Move side effects to POST handler",
    before: "export async function GET() { await db.update(); return Response.json({}) }",
    after: "export async function POST() { await db.update(); return Response.json({}) }",
    explanation: "Use POST for mutations to prevent CSRF and unintended prefetch triggers",
  },
  "server-after-nonblocking": {
    title: "Wrap logging in after()",
    before: "console.log('done'); analytics.track(event);",
    after: "after(() => { console.log('done'); analytics.track(event); });",
    explanation: "Use after() to run non-critical work after response is sent",
  },
};

const formatDiagnosticForReport = (diagnostic: Diagnostic): string => {
  const severityIcon = diagnostic.severity === "error" ? "✗" : "⚠";
  const location = diagnostic.line > 0 ? `:${diagnostic.line}` : "";
  return `  ${severityIcon} ${diagnostic.message}\n     at ${diagnostic.filePath}${location}`;
};

const generateAIPrompt = (context: AIPromptContext): string => {
  const fixStrategy = RULE_FIX_STRATEGIES[context.rule];

  return `Fix this Vercel optimization issue:

**Rule:** ${context.rule}
**File:** ${context.filePath}:${context.line}
**Severity:** ${context.severity}
**Issue:** ${context.issue}

**Fix Strategy:**
${fixStrategy?.explanation || context.fixStrategy}

${fixStrategy
      ? `**Example:**
\`\`\`
// Before:
${fixStrategy.before}

// After:
${fixStrategy.after}
\`\`\``
      : ""
    }

Instructions:
1. Locate the issue in the specified file
2. Apply the suggested fix while maintaining existing functionality
3. Ensure any imported types or dependencies remain valid
4. Test that the change works as expected`;
};

export const groupDiagnosticsByCategory = (diagnostics: Diagnostic[]): ReportSection[] => {
  const grouped = new Map<string, Diagnostic[]>();

  for (const diagnostic of diagnostics) {
    const category = diagnostic.category || "General";
    const existing = grouped.get(category) ?? [];
    existing.push(diagnostic);
    grouped.set(category, existing);
  }

  return [...grouped.entries()].map(([category, categoryDiagnostics]) => {
    const categoryInfo = CATEGORY_DESCRIPTIONS[category] ?? {
      description: "General code quality issues",
      impact: "May affect performance or maintainability",
    };

    return {
      title: category,
      diagnostics: categoryDiagnostics,
      description: categoryInfo.description,
      impact: categoryInfo.impact,
    };
  });
};

export const generateHumanReadableReport = (diagnostics: Diagnostic[]): string => {
  if (diagnostics.length === 0) {
    return `
✅ No Vercel optimization issues found!

Your project follows Vercel best practices for performance and cost optimization.
`;
  }

  const sections = groupDiagnosticsByCategory(diagnostics);
  const errorCount = diagnostics.filter((d) => d.severity === "error").length;
  const warningCount = diagnostics.filter((d) => d.severity === "warning").length;

  let report = `
📊 Vercel Doctor Report
═══════════════════════════════════════════════════════════════

Summary: ${errorCount} errors, ${warningCount} warnings across ${diagnostics.length} issues

`;

  for (const section of sections) {
    const errorCountInSection = section.diagnostics.filter((d) => d.severity === "error").length;
    const warningCountInSection = section.diagnostics.filter(
      (d) => d.severity === "warning",
    ).length;

    report += `\n${section.title} (${errorCountInSection} errors, ${warningCountInSection} warnings)\n`;
    report += `${"─".repeat(section.title.length + 30)}\n`;
    report += `Description: ${section.description}\n`;
    report += `Impact: ${section.impact}\n\n`;

    for (const diagnostic of section.diagnostics) {
      report += formatDiagnosticForReport(diagnostic);
      if (diagnostic.help) {
        report += `\n     💡 ${diagnostic.help}`;
      }
      report += "\n\n";
    }
  }

  return report;
};

export const generateAIPromptsMarkdown = (
  diagnostics: Diagnostic[],
  // #9: optional timestamp param for deterministic snapshot testing
  timestamp = new Date().toISOString(),
): string => {
  const fixableDiagnostics = diagnostics.filter((d) => RULE_FIX_STRATEGIES[d.rule]);

  if (fixableDiagnostics.length === 0) {
    return "# AI Fix Prompts\n\nNo auto-fixable issues detected.\n";
  }

  let report = `# AI Fix Prompts for Vercel Doctor Issues\n\n`;
  report += `**Generated:** ${timestamp}\n\n`;
  report += `> Copy any section below and paste it into Cursor, Claude, Windsurf, or other AI coding tools.\n\n`;
  report += `---\n\n`;

  for (const diagnostic of fixableDiagnostics) {
    const fix = RULE_FIX_STRATEGIES[diagnostic.rule];
    if (!fix) continue;

    const location = diagnostic.line > 0 ? `:${diagnostic.line}` : "";

    report += `## ${fix.title}\n\n`;
    report += `- **File:** \`${diagnostic.filePath}${location}\`\n`;
    report += `- **Rule:** \`${diagnostic.plugin}/${diagnostic.rule}\`\n`;
    report += `- **Issue:** ${diagnostic.message}\n\n`;
    report += `### Prompt\n\n`;
    report += "\`\`\`\n";
    report += generateAIPrompt({
      rule: diagnostic.rule,
      issue: diagnostic.message,
      filePath: diagnostic.filePath,
      line: diagnostic.line,
      severity: diagnostic.severity,
      fixStrategy: diagnostic.help,
    });
    report += "\n\`\`\`\n\n";
    report += `---\n\n`;
  }

  return report;
};

// #10: Array of objects instead of Map — prevents silent key collisions when multiple
// diagnostics share the same plugin/rule::filePath:line key.
export interface AIPromptEntry {
  key: string;
  prompt: string;
}

export const generateAIPrompts = (diagnostics: Diagnostic[]): AIPromptEntry[] => {
  return diagnostics.map((diagnostic) => {
    const context: AIPromptContext = {
      rule: diagnostic.rule,
      issue: diagnostic.message,
      filePath: diagnostic.filePath,
      line: diagnostic.line,
      severity: diagnostic.severity,
      fixStrategy: diagnostic.help,
    };
    return {
      key: `${diagnostic.plugin}/${diagnostic.rule}::${diagnostic.filePath}:${diagnostic.line}`,
      prompt: generateAIPrompt(context),
    };
  });
};


export const generateMarkdownReport = (
  diagnostics: Diagnostic[],
  projectName: string,
  // #9: optional timestamp param for deterministic snapshot testing
  timestamp = new Date().toISOString(),
): string => {
  const sections = groupDiagnosticsByCategory(diagnostics);
  const errorCount = diagnostics.filter((d) => d.severity === "error").length;
  const warningCount = diagnostics.filter((d) => d.severity === "warning").length;

  let report = `# Vercel Doctor Report: ${projectName}\n\n`;
  report += `**Generated:** ${timestamp}\n\n`;
  report += `## Summary\n\n`;
  report += `- **Total Issues:** ${diagnostics.length}\n`;
  report += `- **Errors:** ${errorCount}\n`;
  report += `- **Warnings:** ${warningCount}\n\n`;

  if (diagnostics.length === 0) {
    report += "✅ No issues found! Your project follows Vercel best practices.\n";
    return report;
  }

  for (const section of sections) {
    report += `## ${section.title}\n\n`;
    report += `> ${section.description}\n\n`;
    report += `**Impact:** ${section.impact}\n\n`;

    for (const diagnostic of section.diagnostics) {
      const icon = diagnostic.severity === "error" ? "❌" : "⚠️";
      const location = diagnostic.line > 0 ? `:${diagnostic.line}` : "";
      report += `### ${icon} ${diagnostic.message}\n\n`;
      report += `- **File:** \`${diagnostic.filePath}${location}\`\n`;
      report += `- **Rule:** \`${diagnostic.plugin}/${diagnostic.rule}\`\n`;
      if (diagnostic.help) {
        report += `- **Suggestion:** ${diagnostic.help}\n`;
      }

      const fix = RULE_FIX_STRATEGIES[diagnostic.rule];
      if (fix) {
        report += `\n<details>\n<summary>🤖 AI Fix Prompt (Click to expand)</summary>\n\n`;
        report += "\`\`\`\n";
        report += generateAIPrompt({
          rule: diagnostic.rule,
          issue: diagnostic.message,
          filePath: diagnostic.filePath,
          line: diagnostic.line,
          severity: diagnostic.severity,
          fixStrategy: diagnostic.help,
        });
        report += "\n\`\`\`\n\n</details>\n";
      }

      report += "\n";
    }
  }

  return report;
};
