import { RULE_CATEGORY_DETAILS, RULE_FIX_STRATEGIES } from "../rule-metadata.js";
import { PLUGIN_RULE_IDS, VERCEL_RULE_IDS } from "../rule-ids.js";
import type { Diagnostic } from "../types.js";
import {
  DIAGNOSTIC_SEVERITY_MARKDOWN_SYMBOLS,
  DIAGNOSTIC_SEVERITY_SYMBOLS,
} from "./diagnostic-severity.js";
import { summarizeDiagnostics } from "./summarize-diagnostics.js";

export interface ReportSection {
  title: string;
  diagnostics: Diagnostic[];
  description: string;
  impact: string;
}

export interface AIPromptContext {
  rule: string;
  issue: string;
  filePath: string;
  line: number;
  column: number;
  severity: "error" | "warning";
  fixStrategy: string;
}

export { RULE_FIX_STRATEGIES } from "../rule-metadata.js";

const BETTER_ALL_CODEMOD_PROMPT_KEY = "vercel-doctor/better-all-codemod";
const BETTER_ALL_CODEMOD_PROMPT_TITLE = "Codemod: Promise.all to better-all";
const BETTER_ALL_CODEMOD_TRIGGER_RULE_IDS = new Set([
  PLUGIN_RULE_IDS.ASYNC_PARALLEL,
  VERCEL_RULE_IDS.EDGE_SEQUENTIAL_AWAIT,
  VERCEL_RULE_IDS.SEQUENTIAL_DATABASE_AWAIT,
]);

const shouldIncludeBetterAllCodemodPrompt = (diagnostics: Diagnostic[]): boolean =>
  diagnostics.some((diagnostic) => BETTER_ALL_CODEMOD_TRIGGER_RULE_IDS.has(diagnostic.rule));

const createBetterAllCodemodPrompt =
  (): string => `Create a migration plan to replace Promise.all with better-all across the repository.

Goals:
1. Find all Promise.all usages and classify each one as safe/unsafe for codemod.
2. Convert safe cases to \`all()\` from better-all using stable, descriptive object keys.
3. Keep behavior equivalent, including error handling and return shapes.
4. List skipped or ambiguous cases with exact file locations and reasons.

Execution policy:
1. Start with a dry-run patch and review it first.
2. Run lint, typecheck, and tests on the reviewed patch.
3. Only after checks pass, apply the codemod changes.
4. Provide a final summary of migrated files and skipped cases.`;

const formatDiagnosticForReport = (diagnostic: Diagnostic): string => {
  const severityIcon = DIAGNOSTIC_SEVERITY_SYMBOLS[diagnostic.severity];
  return `  ${severityIcon} ${diagnostic.message}\n     at ${buildDiagnosticLocation(diagnostic)}`;
};

const buildDiagnosticLocation = (diagnostic: Diagnostic): string =>
  diagnostic.line > 0 ? `${diagnostic.filePath}:${diagnostic.line}` : diagnostic.filePath;

const createAIPromptContext = (diagnostic: Diagnostic): AIPromptContext => ({
  rule: diagnostic.rule,
  issue: diagnostic.message,
  filePath: diagnostic.filePath,
  line: diagnostic.line,
  column: diagnostic.column,
  severity: diagnostic.severity,
  fixStrategy: diagnostic.help,
});

const generateAIPrompt = (context: AIPromptContext): string => {
  const fixStrategy = RULE_FIX_STRATEGIES[context.rule];

  return `Fix this Vercel optimization issue:

**Rule:** ${context.rule}
**File:** ${context.filePath}:${context.line}:${context.column}
**Severity:** ${context.severity}
**Issue:** ${context.issue}

**Fix Strategy:**
${fixStrategy?.explanation || context.fixStrategy}

${
  fixStrategy
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
    const categoryInfo = RULE_CATEGORY_DETAILS[category] ?? RULE_CATEGORY_DETAILS.Other;

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
  const diagnosticSummary = summarizeDiagnostics(diagnostics);

  let report = `
📊 Vercel Doctor Report
═══════════════════════════════════════════════════════════════

Summary: ${diagnosticSummary.errorCount} errors, ${diagnosticSummary.warningCount} warnings across ${diagnostics.length} issues

`;

  for (const section of sections) {
    const sectionSummary = summarizeDiagnostics(section.diagnostics);

    report += `\n${section.title} (${sectionSummary.errorCount} errors, ${sectionSummary.warningCount} warnings)\n`;
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
  const shouldAddBetterAllCodemodPrompt = shouldIncludeBetterAllCodemodPrompt(diagnostics);

  if (fixableDiagnostics.length === 0 && !shouldAddBetterAllCodemodPrompt) {
    return "# AI Fix Prompts\n\nNo auto-fixable issues detected.\n";
  }

  let report = `# AI Fix Prompts for Vercel Doctor Issues\n\n`;
  report += `**Generated:** ${timestamp}\n\n`;
  report += `> Copy any section below and paste it into Cursor, Claude, Windsurf, or other AI coding tools.\n\n`;
  report += `---\n\n`;

  for (const diagnostic of fixableDiagnostics) {
    const fix = RULE_FIX_STRATEGIES[diagnostic.rule];
    if (!fix) continue;

    report += `## ${fix.title}\n\n`;
    report += `- **File:** \`${buildDiagnosticLocation(diagnostic)}\`\n`;
    report += `- **Rule:** \`${diagnostic.plugin}/${diagnostic.rule}\`\n`;
    report += `- **Issue:** ${diagnostic.message}\n\n`;
    report += `### Prompt\n\n`;
    report += "```\n";
    report += generateAIPrompt(createAIPromptContext(diagnostic));
    report += "\n```\n\n";
    report += `---\n\n`;
  }

  if (shouldAddBetterAllCodemodPrompt) {
    report += `## ${BETTER_ALL_CODEMOD_PROMPT_TITLE}\n\n`;
    report += `- **Rule:** \`${BETTER_ALL_CODEMOD_PROMPT_KEY}\`\n`;
    report += `- **Issue:** Replace Promise.all with better-all repository-wide after safe review.\n\n`;
    report += `### Prompt\n\n`;
    report += "```\n";
    report += createBetterAllCodemodPrompt();
    report += "\n```\n\n";
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
  const aiPromptEntries = diagnostics
    .filter((d) => RULE_FIX_STRATEGIES[d.rule])
    .map((diagnostic) => ({
      key: `${diagnostic.plugin}/${diagnostic.rule}::${diagnostic.filePath}:${diagnostic.line}:${diagnostic.column}`,
      prompt: generateAIPrompt(createAIPromptContext(diagnostic)),
    }));

  if (shouldIncludeBetterAllCodemodPrompt(diagnostics)) {
    aiPromptEntries.push({
      key: BETTER_ALL_CODEMOD_PROMPT_KEY,
      prompt: createBetterAllCodemodPrompt(),
    });
  }

  return aiPromptEntries;
};

export const generateMarkdownReport = (
  diagnostics: Diagnostic[],
  projectName: string,
  // #9: optional timestamp param for deterministic snapshot testing
  timestamp = new Date().toISOString(),
): string => {
  const sections = groupDiagnosticsByCategory(diagnostics);
  const diagnosticSummary = summarizeDiagnostics(diagnostics);

  let report = `# Vercel Doctor Report: ${projectName}\n\n`;
  report += `**Generated:** ${timestamp}\n\n`;
  report += `## Summary\n\n`;
  report += `- **Total Issues:** ${diagnostics.length}\n`;
  report += `- **Errors:** ${diagnosticSummary.errorCount}\n`;
  report += `- **Warnings:** ${diagnosticSummary.warningCount}\n\n`;

  if (diagnostics.length === 0) {
    report += "✅ No issues found! Your project follows Vercel best practices.\n";
    return report;
  }

  for (const section of sections) {
    report += `## ${section.title}\n\n`;
    report += `> ${section.description}\n\n`;
    report += `**Impact:** ${section.impact}\n\n`;

    for (const diagnostic of section.diagnostics) {
      const icon = DIAGNOSTIC_SEVERITY_MARKDOWN_SYMBOLS[diagnostic.severity];
      report += `### ${icon} ${diagnostic.message}\n\n`;
      report += `- **File:** \`${buildDiagnosticLocation(diagnostic)}\`\n`;
      report += `- **Rule:** \`${diagnostic.plugin}/${diagnostic.rule}\`\n`;
      if (diagnostic.help) {
        report += `- **Suggestion:** ${diagnostic.help}\n`;
      }

      const fix = RULE_FIX_STRATEGIES[diagnostic.rule];
      if (fix) {
        report += `\n<details>\n<summary>🤖 AI Fix Prompt (Click to expand)</summary>\n\n`;
        report += "```\n";
        report += generateAIPrompt(createAIPromptContext(diagnostic));
        report += "\n```\n\n</details>\n";
      }

      report += "\n";
    }
  }

  return report;
};
