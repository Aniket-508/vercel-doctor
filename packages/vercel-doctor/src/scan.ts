import { randomUUID } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { performance } from "node:perf_hooks";
import {
  JSX_FILE_PATTERN,
  MILLISECONDS_PER_SECOND,
  OFFLINE_FLAG_MESSAGE,
  OFFLINE_MESSAGE,
  PERFECT_SCORE,
  SCORE_BAR_WIDTH_CHARS,
  SCORE_GOOD_THRESHOLD,
  SCORE_OK_THRESHOLD,
  SHARE_BASE_URL,
  VERCEL_DOCTOR_BRAND_LABEL,
  VERCEL_DOCTOR_BRAND_NAME,
  VERCEL_DOCTOR_WEBSITE_LABEL,
} from "./constants.js";
import type { Diagnostic, ScanOptions, ScanResult, ScoreResult } from "./types.js";
import { calculateScore } from "./utils/calculate-score.js";
import {
  colorizeDiagnosticSeverity,
  DIAGNOSTIC_SEVERITY_ORDER,
  DIAGNOSTIC_SEVERITY_SYMBOLS,
} from "./utils/diagnostic-severity.js";
import { discoverProject, formatFrameworkName } from "./utils/discover-project.js";
import { filterIgnoredDiagnostics } from "./utils/filter-diagnostics.js";
import { type FramedLine, createFramedLine, printFramedBox } from "./utils/framed-box.js";
import { generateMarkdownReport } from "./utils/generate-report.js";
import { groupBy } from "./utils/group-by.js";
import { highlighter } from "./utils/highlighter.js";
import { indentMultilineText } from "./utils/indent-multiline-text.js";
import { loadConfig } from "./utils/load-config.js";
import { logger } from "./utils/logger.js";
import { runKnip } from "./utils/run-knip.js";
import { runOxlint } from "./utils/run-oxlint.js";
import { runVercelChecks } from "./utils/run-vercel-checks.js";
import { summarizeDiagnostics } from "./utils/summarize-diagnostics.js";
import { spinner } from "./utils/spinner.js";

interface ScoreBarSegments {
  filledSegment: string;
  emptySegment: string;
}

const sortBySeverity = (diagnosticGroups: [string, Diagnostic[]][]): [string, Diagnostic[]][] =>
  diagnosticGroups.toSorted(([, diagnosticsA], [, diagnosticsB]) => {
    const severityA = DIAGNOSTIC_SEVERITY_ORDER[diagnosticsA[0].severity];
    const severityB = DIAGNOSTIC_SEVERITY_ORDER[diagnosticsB[0].severity];
    return severityA - severityB;
  });

const getSortedRuleGroups = (diagnostics: Diagnostic[]): [string, Diagnostic[]][] =>
  sortBySeverity([
    ...groupBy(diagnostics, (diagnostic) => `${diagnostic.plugin}/${diagnostic.rule}`).entries(),
  ]);

const buildFileLineMap = (diagnostics: Diagnostic[]): Map<string, number[]> => {
  const fileLines = new Map<string, number[]>();
  for (const diagnostic of diagnostics) {
    const lines = fileLines.get(diagnostic.filePath) ?? [];
    if (diagnostic.line > 0) {
      lines.push(diagnostic.line);
    }
    fileLines.set(diagnostic.filePath, lines);
  }
  return fileLines;
};

const printDiagnostics = (diagnostics: Diagnostic[], isVerbose: boolean): void => {
  for (const [, ruleDiagnostics] of getSortedRuleGroups(diagnostics)) {
    const firstDiagnostic = ruleDiagnostics[0];
    const severitySymbol = DIAGNOSTIC_SEVERITY_SYMBOLS[firstDiagnostic.severity];
    const icon = colorizeDiagnosticSeverity(severitySymbol, firstDiagnostic.severity);
    const count = ruleDiagnostics.length;
    const countLabel =
      count > 1 ? colorizeDiagnosticSeverity(` (${count})`, firstDiagnostic.severity) : "";

    logger.log(`  ${icon} ${firstDiagnostic.message}${countLabel}`);
    if (firstDiagnostic.help) {
      logger.dim(indentMultilineText(firstDiagnostic.help, "    "));
    }

    if (isVerbose) {
      const fileLines = buildFileLineMap(ruleDiagnostics);

      for (const [filePath, lines] of fileLines) {
        const lineLabel = lines.length > 0 ? `: ${lines.join(", ")}` : "";
        logger.dim(`    ${filePath}${lineLabel}`);
      }
    }

    logger.break();
  }
};

const formatElapsedTime = (elapsedMilliseconds: number): string => {
  if (elapsedMilliseconds < MILLISECONDS_PER_SECOND) {
    return `${Math.round(elapsedMilliseconds)}ms`;
  }
  return `${(elapsedMilliseconds / MILLISECONDS_PER_SECOND).toFixed(1)}s`;
};

const formatRuleSummary = (ruleKey: string, ruleDiagnostics: Diagnostic[]): string => {
  const firstDiagnostic = ruleDiagnostics[0];
  const fileLines = buildFileLineMap(ruleDiagnostics);

  const sections = [
    `Rule: ${ruleKey}`,
    `Severity: ${firstDiagnostic.severity}`,
    `Category: ${firstDiagnostic.category}`,
    `Count: ${ruleDiagnostics.length}`,
    "",
    firstDiagnostic.message,
  ];

  if (firstDiagnostic.help) {
    sections.push("", `Suggestion: ${firstDiagnostic.help}`);
  }

  sections.push("", "Files:");
  for (const [filePath, lines] of fileLines) {
    const lineLabel = lines.length > 0 ? `: ${lines.join(", ")}` : "";
    sections.push(`  ${filePath}${lineLabel}`);
  }

  return sections.join("\n") + "\n";
};

const writeDiagnosticsDirectory = (diagnostics: Diagnostic[]): string => {
  const outputDirectory = join(tmpdir(), `vercel-doctor-${randomUUID()}`);
  mkdirSync(outputDirectory);

  for (const [ruleKey, ruleDiagnostics] of getSortedRuleGroups(diagnostics)) {
    const fileName = ruleKey.replace(/\//g, "--") + ".txt";
    writeFileSync(join(outputDirectory, fileName), formatRuleSummary(ruleKey, ruleDiagnostics));
  }

  writeFileSync(join(outputDirectory, "diagnostics.json"), JSON.stringify(diagnostics, null, 2));

  return outputDirectory;
};

const colorizeByScore = (text: string, score: number): string => {
  if (score >= SCORE_GOOD_THRESHOLD) return highlighter.success(text);
  if (score >= SCORE_OK_THRESHOLD) return highlighter.warn(text);
  return highlighter.error(text);
};

const buildScoreBarSegments = (score: number): ScoreBarSegments => {
  const filledCount = Math.round((score / PERFECT_SCORE) * SCORE_BAR_WIDTH_CHARS);
  const emptyCount = SCORE_BAR_WIDTH_CHARS - filledCount;

  return {
    filledSegment: "█".repeat(filledCount),
    emptySegment: "░".repeat(emptyCount),
  };
};

const buildPlainScoreBar = (score: number): string => {
  const { filledSegment, emptySegment } = buildScoreBarSegments(score);
  return `${filledSegment}${emptySegment}`;
};

const buildScoreBar = (score: number): string => {
  const { filledSegment, emptySegment } = buildScoreBarSegments(score);
  return colorizeByScore(filledSegment, score) + highlighter.dim(emptySegment);
};

const printScoreGauge = (score: number, label: string): void => {
  const scoreDisplay = colorizeByScore(`${score}`, score);
  const labelDisplay = colorizeByScore(label, score);
  logger.log(`  ${scoreDisplay} / ${PERFECT_SCORE}  ${labelDisplay}`);
  logger.break();
  logger.log(`  ${buildScoreBar(score)}`);
  logger.break();
};

const getDoctorFace = (score: number): string[] => {
  if (score >= SCORE_GOOD_THRESHOLD) return ["◠ ◠", " ▽ "];
  if (score >= SCORE_OK_THRESHOLD) return ["• •", " ─ "];
  return ["x x", " ▽ "];
};

const renderBrandLabel = (): string =>
  `${VERCEL_DOCTOR_BRAND_NAME} ${highlighter.dim(VERCEL_DOCTOR_WEBSITE_LABEL)}`;

const printCompletedSteps = (messages: string[]): void => {
  for (const message of messages) {
    spinner(message).start().succeed(message);
  }

  logger.break();
};

const logTaskError = (error: unknown, shouldIncludeStack: boolean): void => {
  if (error instanceof Error) {
    logger.error(error.message);

    if (shouldIncludeStack && error.stack) {
      logger.dim(error.stack);
    }

    return;
  }

  logger.error(String(error));
};

const runDiagnosticTask = async (
  isEnabled: boolean,
  shouldRenderSpinner: boolean,
  startMessage: string,
  successMessage: string,
  failureMessage: string,
  runTask: () => Promise<Diagnostic[]> | Diagnostic[],
  shouldIncludeStack = false,
): Promise<Diagnostic[]> => {
  if (!isEnabled) {
    return [];
  }

  const taskSpinner = shouldRenderSpinner ? spinner(startMessage).start() : null;

  try {
    const diagnostics = await runTask();
    taskSpinner?.succeed(successMessage);
    return diagnostics;
  } catch (error) {
    taskSpinner?.fail(failureMessage);
    logTaskError(error, shouldIncludeStack);
    return [];
  }
};

const printBranding = (score?: number): void => {
  if (score !== undefined) {
    const [eyes, mouth] = getDoctorFace(score);
    const colorize = (text: string) => colorizeByScore(text, score);
    logger.log(colorize("  ┌─────┐"));
    logger.log(colorize(`  │ ${eyes} │`));
    logger.log(colorize(`  │ ${mouth} │`));
    logger.log(colorize("  └─────┘"));
  }
  logger.log(`  ${renderBrandLabel()}`);
  logger.break();
};

const buildShareUrl = (
  diagnostics: Diagnostic[],
  scoreResult: ScoreResult | null,
  projectName: string,
): string => {
  const diagnosticSummary = summarizeDiagnostics(diagnostics);

  const params = new URLSearchParams();
  params.set("p", projectName);
  if (scoreResult) params.set("s", String(scoreResult.score));
  if (diagnosticSummary.errorCount > 0) params.set("e", String(diagnosticSummary.errorCount));
  if (diagnosticSummary.warningCount > 0) {
    params.set("w", String(diagnosticSummary.warningCount));
  }
  if (diagnosticSummary.affectedFileCount > 0) {
    params.set("f", String(diagnosticSummary.affectedFileCount));
  }

  return `${SHARE_BASE_URL}?${params.toString()}`;
};

const printSummary = (
  diagnostics: Diagnostic[],
  elapsedMilliseconds: number,
  scoreResult: ScoreResult | null,
  projectName: string,
  totalSourceFileCount: number,
  noScoreMessage: string,
): void => {
  const diagnosticSummary = summarizeDiagnostics(diagnostics);
  const elapsed = formatElapsedTime(elapsedMilliseconds);

  const summaryLineParts: string[] = [];
  const summaryLinePartsPlain: string[] = [];
  if (diagnosticSummary.errorCount > 0) {
    const errorText = `✗ ${diagnosticSummary.errorCount} error${diagnosticSummary.errorCount === 1 ? "" : "s"}`;
    summaryLinePartsPlain.push(errorText);
    summaryLineParts.push(highlighter.error(errorText));
  }
  if (diagnosticSummary.warningCount > 0) {
    const warningText = `⚠ ${diagnosticSummary.warningCount} warning${diagnosticSummary.warningCount === 1 ? "" : "s"}`;
    summaryLinePartsPlain.push(warningText);
    summaryLineParts.push(highlighter.warn(warningText));
  }
  const fileCountText =
    totalSourceFileCount > 0
      ? `across ${diagnosticSummary.affectedFileCount}/${totalSourceFileCount} files`
      : `across ${diagnosticSummary.affectedFileCount} file${diagnosticSummary.affectedFileCount === 1 ? "" : "s"}`;
  const elapsedTimeText = `in ${elapsed}`;

  summaryLinePartsPlain.push(fileCountText);
  summaryLinePartsPlain.push(elapsedTimeText);
  summaryLineParts.push(highlighter.dim(fileCountText));
  summaryLineParts.push(highlighter.dim(elapsedTimeText));

  const summaryFramedLines: FramedLine[] = [];
  if (scoreResult) {
    const [eyes, mouth] = getDoctorFace(scoreResult.score);
    const scoreColorizer = (text: string): string => colorizeByScore(text, scoreResult.score);

    summaryFramedLines.push(createFramedLine("┌─────┐", scoreColorizer("┌─────┐")));
    summaryFramedLines.push(createFramedLine(`│ ${eyes} │`, scoreColorizer(`│ ${eyes} │`)));
    summaryFramedLines.push(createFramedLine(`│ ${mouth} │`, scoreColorizer(`│ ${mouth} │`)));
    summaryFramedLines.push(createFramedLine("└─────┘", scoreColorizer("└─────┘")));
    summaryFramedLines.push(createFramedLine(VERCEL_DOCTOR_BRAND_LABEL, renderBrandLabel()));
    summaryFramedLines.push(createFramedLine(""));

    const scoreLinePlainText = `${scoreResult.score} / ${PERFECT_SCORE}  ${scoreResult.label}`;
    const scoreLineRenderedText = `${colorizeByScore(
      String(scoreResult.score),
      scoreResult.score,
    )} / ${PERFECT_SCORE}  ${colorizeByScore(scoreResult.label, scoreResult.score)}`;
    summaryFramedLines.push(createFramedLine(scoreLinePlainText, scoreLineRenderedText));
    summaryFramedLines.push(createFramedLine(""));
    summaryFramedLines.push(
      createFramedLine(buildPlainScoreBar(scoreResult.score), buildScoreBar(scoreResult.score)),
    );
    summaryFramedLines.push(createFramedLine(""));
  } else {
    summaryFramedLines.push(createFramedLine(VERCEL_DOCTOR_BRAND_LABEL, renderBrandLabel()));
    summaryFramedLines.push(createFramedLine(""));
    summaryFramedLines.push(createFramedLine(noScoreMessage, highlighter.dim(noScoreMessage)));
    summaryFramedLines.push(createFramedLine(""));
  }

  summaryFramedLines.push(
    createFramedLine(summaryLinePartsPlain.join("  "), summaryLineParts.join("  ")),
  );
  printFramedBox(summaryFramedLines);

  try {
    const diagnosticsDirectory = writeDiagnosticsDirectory(diagnostics);
    logger.break();
    logger.dim(`  Full diagnostics written to ${diagnosticsDirectory}`);
  } catch {
    logger.break();
  }

  const shareUrl = buildShareUrl(diagnostics, scoreResult, projectName);
  logger.break();
  logger.dim(`  Share your results: ${highlighter.info(shareUrl)}`);
};

export const scan = async (
  directory: string,
  inputOptions: ScanOptions = {},
): Promise<ScanResult> => {
  const startTime = performance.now();
  const projectInfo = discoverProject(directory);
  const userConfig = loadConfig(directory);

  const options = {
    lint: inputOptions.lint ?? userConfig?.lint ?? true,
    deadCode: inputOptions.deadCode ?? userConfig?.deadCode ?? true,
    verbose: inputOptions.verbose ?? userConfig?.verbose ?? false,
    scoreOnly: inputOptions.scoreOnly ?? false,
    offline: inputOptions.offline ?? false,
    includePaths: inputOptions.includePaths,
    output: inputOptions.output ?? "human",
  };

  const includePaths = options.includePaths ?? [];
  const isDiffMode = includePaths.length > 0;

  if (!projectInfo.reactVersion) {
    throw new Error("No React dependency found in package.json");
  }

  if (!options.scoreOnly) {
    const frameworkLabel = formatFrameworkName(projectInfo.framework);
    const languageLabel = projectInfo.hasTypeScript ? "TypeScript" : "JavaScript";
    const projectStepMessages = [
      `Detecting framework. Found ${highlighter.info(frameworkLabel)}.`,
      `Detecting React version. Found ${highlighter.info(`React ${projectInfo.reactVersion}`)}.`,
      `Detecting language. Found ${highlighter.info(languageLabel)}.`,
      isDiffMode
        ? `Scanning ${highlighter.info(`${includePaths.length}`)} changed source files.`
        : `Found ${highlighter.info(`${projectInfo.sourceFileCount}`)} source files.`,
      ...(userConfig ? [`Loaded ${highlighter.info("vercel-doctor config")}.`] : []),
    ];

    printCompletedSteps(projectStepMessages);
  }

  const jsxIncludePaths = isDiffMode
    ? includePaths.filter((filePath) => JSX_FILE_PATTERN.test(filePath))
    : undefined;

  const lintPromise = runDiagnosticTask(
    options.lint,
    !options.scoreOnly,
    "Running lint checks...",
    "Running lint checks.",
    "Lint checks failed (non-fatal, skipping).",
    () => runOxlint(directory, projectInfo.hasTypeScript, projectInfo.framework, jsxIncludePaths),
    true,
  );

  const deadCodePromise = runDiagnosticTask(
    options.deadCode && !isDiffMode,
    !options.scoreOnly,
    "Detecting dead code...",
    "Detecting dead code.",
    "Dead code detection failed (non-fatal, skipping).",
    () => runKnip(directory),
  );

  const vercelChecksPromise = runDiagnosticTask(
    true,
    !options.scoreOnly,
    "Running Vercel optimization checks...",
    "Running Vercel optimization checks.",
    "Vercel optimization checks failed (non-fatal, skipping).",
    () =>
      runVercelChecks(directory, {
        includePaths: isDiffMode ? includePaths : undefined,
      }),
  );

  const [lintDiagnostics, deadCodeDiagnostics, vercelDiagnostics] = await Promise.all([
    lintPromise,
    deadCodePromise,
    vercelChecksPromise,
  ]);
  const allDiagnostics = [...lintDiagnostics, ...deadCodeDiagnostics, ...vercelDiagnostics];
  const diagnostics = userConfig
    ? filterIgnoredDiagnostics(allDiagnostics, userConfig)
    : allDiagnostics;

  const elapsedMilliseconds = performance.now() - startTime;

  const scoreResult = options.offline ? null : await calculateScore(diagnostics);
  const noScoreMessage = options.offline ? OFFLINE_FLAG_MESSAGE : OFFLINE_MESSAGE;

  if (options.scoreOnly) {
    if (scoreResult) {
      logger.log(`${scoreResult.score}`);
    } else {
      logger.dim(noScoreMessage);
    }
    return { diagnostics, scoreResult };
  }

  // #2: JSON output — emit structured data and return early (no terminal UI)
  if (options.output === "json") {
    logger.log(JSON.stringify({ diagnostics, scoreResult }, null, 2));
    return { diagnostics, scoreResult };
  }

  if (diagnostics.length === 0) {
    logger.success("No issues found!");
    logger.break();
    if (scoreResult) {
      printBranding(scoreResult.score);
      printScoreGauge(scoreResult.score, scoreResult.label);
    } else {
      logger.dim(`  ${noScoreMessage}`);
    }
    return { diagnostics, scoreResult };
  }

  const displayedSourceFileCount = isDiffMode ? includePaths.length : projectInfo.sourceFileCount;

  // #1: "human" is the sole terminal format — printDiagnostics/printSummary only run here.
  // "markdown" to stdout is handled by cli.ts after scan() returns.
  if (options.output === "human") {
    printDiagnostics(diagnostics, options.verbose);
    printSummary(
      diagnostics,
      elapsedMilliseconds,
      scoreResult,
      projectInfo.projectName,
      displayedSourceFileCount,
      noScoreMessage,
    );
  } else if (options.output === "markdown") {
    // Markdown to stdout — #4: file writes are handled by cli.ts
    const markdownReport = generateMarkdownReport(diagnostics, projectInfo.projectName);
    logger.break();
    logger.log(markdownReport);
  }

  return { diagnostics, scoreResult };
};
