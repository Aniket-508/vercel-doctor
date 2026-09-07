import { writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";

import { Command } from "commander";

import { scan } from "./scan.js";
import type { Diagnostic, DiffInfo, ScanOptions, ScanResult } from "./types.js";
import {
  generateMarkdownReport,
  generateAIPrompts,
  generateAIPromptsMarkdown,
} from "./utils/generate-report.js";
import { filterSourceFiles, getDiffInfo } from "./utils/get-diff-files.js";
import { handleError } from "./utils/handle-error.js";
import { highlighter } from "./utils/highlighter.js";
import { loadConfig } from "./utils/load-config.js";
import { logger } from "./utils/logger.js";
import { prompts } from "./utils/prompts.js";
import { selectProjects } from "./utils/select-projects.js";
import { maybePromptSkillInstall } from "./utils/skill-prompt.js";

const VERSION = process.env.VERSION ?? "0.0.0";

interface CliFlags {
  lint: boolean;
  deadCode: boolean;
  verbose: boolean;
  score: boolean;
  yes: boolean;
  offline: boolean;
  project?: string;
  diff?: boolean | string;
  output?: "human" | "json" | "markdown";
  report?: string;
  aiPrompts?: string;
}

interface ProjectScanResult extends ScanResult {
  directory: string;
}

const exitWithFixHint = () => {
  logger.break();
  logger.log("Cancelled.");
  logger.dim("Documentation: https://github.com/Aniket-508/vercel-doctor");
  logger.break();
  process.exit(0);
};

process.on("SIGINT", exitWithFixHint);
process.on("SIGTERM", exitWithFixHint);

const getIncludePathsForProject = (
  projectDirectory: string,
  isDiffMode: boolean,
  explicitBaseBranch: string | undefined,
  isScoreOnly: boolean,
): { includePaths: string[] | undefined; shouldSkip: boolean } => {
  if (!isDiffMode) {
    return { includePaths: undefined, shouldSkip: false };
  }
  const projectDiffInfo = getDiffInfo(projectDirectory, explicitBaseBranch);
  if (!projectDiffInfo) {
    return { includePaths: undefined, shouldSkip: false };
  }
  const changedSourceFiles = filterSourceFiles(projectDiffInfo.changedFiles);
  if (changedSourceFiles.length === 0) {
    if (!isScoreOnly) {
      logger.dim(`No changed source files in ${projectDirectory}, skipping.`);
      logger.break();
    }
    return { includePaths: undefined, shouldSkip: true };
  }
  return { includePaths: changedSourceFiles, shouldSkip: false };
};

const writeReportIfRequested = (
  reportPath: string,
  diagnostics: Diagnostic[],
  projectName: string,
): void => {
  const markdownReport = generateMarkdownReport(diagnostics, projectName);
  mkdirSync(path.dirname(reportPath), { recursive: true });
  writeFileSync(reportPath, markdownReport);
  console.error(`Report written to ${reportPath}`);
};

const writeAiPromptsIfRequested = (
  aiPromptsPath: string,
  diagnostics: Diagnostic[],
): void => {
  const isMarkdown =
    aiPromptsPath.endsWith(".md") || aiPromptsPath.endsWith(".markdown");
  const content = isMarkdown
    ? generateAIPromptsMarkdown(diagnostics)
    : JSON.stringify(
        Object.fromEntries(
          generateAIPrompts(diagnostics).map(({ key, prompt }) => [
            key,
            prompt,
          ]),
        ),
        null,
        2,
      );
  mkdirSync(path.dirname(aiPromptsPath), { recursive: true });
  writeFileSync(aiPromptsPath, content);
  console.error(`AI prompts written to ${aiPromptsPath}`);
};

const getScanOptionsFromFlags = (
  flags: CliFlags,
  userConfig: { deadCode?: boolean; lint?: boolean; verbose?: boolean } | null,
  isCliOverride: (name: string) => boolean,
): ScanOptions => ({
  deadCode: isCliOverride("deadCode") ? flags.deadCode : userConfig?.deadCode,
  lint: isCliOverride("lint") ? flags.lint : userConfig?.lint,
  offline: flags.offline,
  output: flags.output ?? "human",
  scoreOnly: flags.score,
  verbose: isCliOverride("verbose")
    ? Boolean(flags.verbose)
    : userConfig?.verbose,
});

const logDiffModeMessage = (
  isDiffMode: boolean,
  diffInfo: DiffInfo | null,
  isScoreOnly: boolean,
): void => {
  if (!isDiffMode || !diffInfo || isScoreOnly) {
    return;
  }
  if (diffInfo.isCurrentChanges) {
    logger.log("Scanning uncommitted changes");
  } else {
    logger.log(
      `Scanning changes: ${highlighter.info(
        diffInfo.currentBranch,
      )} → ${highlighter.info(diffInfo.baseBranch)}`,
    );
  }
  logger.break();
};

const resolveDiffMode = async (
  diffInfo: DiffInfo | null,
  effectiveDiff: boolean | string | undefined,
  shouldSkipPrompts: boolean,
  isScoreOnly: boolean,
): Promise<boolean> => {
  if (effectiveDiff !== undefined && effectiveDiff !== false) {
    if (diffInfo) {
      return true;
    }
    if (!isScoreOnly) {
      logger.warn(
        "No feature branch or uncommitted changes detected. Running full scan.",
      );
      logger.break();
    }
    return false;
  }

  if (effectiveDiff === false || !diffInfo) {
    return false;
  }

  const changedSourceFiles = filterSourceFiles(diffInfo.changedFiles);
  if (changedSourceFiles.length === 0) {
    return false;
  }
  if (isScoreOnly) {
    return false;
  }
  if (shouldSkipPrompts) {
    return true;
  }

  const promptMessage = diffInfo.isCurrentChanges
    ? `Found ${changedSourceFiles.length} uncommitted changed files. Only scan current changes?`
    : `On branch ${diffInfo.currentBranch} (${changedSourceFiles.length} changed files vs ${diffInfo.baseBranch}). Only scan this branch?`;

  const { shouldScanChangedOnly } = await prompts({
    initial: true,
    message: promptMessage,
    name: "shouldScanChangedOnly",
    type: "confirm",
  });
  return Boolean(shouldScanChangedOnly);
};

const printStructuredOutput = (
  outputFormat: CliFlags["output"],
  projectResults: ProjectScanResult[],
  diagnostics: Diagnostic[],
  directory: string,
  isSingleProject: boolean,
): void => {
  if (outputFormat === "json") {
    const output = isSingleProject
      ? {
          diagnostics: projectResults[0]?.diagnostics ?? [],
          scoreResult: projectResults[0]?.scoreResult ?? null,
        }
      : projectResults;
    logger.log(JSON.stringify(output, null, 2));
    return;
  }
  logger.log(generateMarkdownReport(diagnostics, path.basename(directory)));
};

const program = new Command()
  .name("vercel-doctor")
  .description("Find ways to cut your Vercel bill (Next.js)")
  .version(VERSION, "-v, --version", "display the version number")
  .argument("[directory]", "project directory to scan", ".")
  .option("--no-lint", "skip linting")
  .option("--no-dead-code", "skip dead code detection")
  .option("--verbose", "show file details per rule")
  .option("--score", "output only the score")
  .option("-y, --yes", "skip prompts, scan all workspace projects")
  .option(
    "--project <name>",
    "select workspace project (comma-separated for multiple)",
  )
  .option("--diff [base]", "scan only files changed vs base branch")
  .option(
    "--offline",
    "skip telemetry (anonymous, not stored, only used to calculate score)",
  )
  .option(
    "--output <format>",
    'output format: "human" (default), "json", or "markdown"',
  )
  .option("--report <file>", "write human-readable report to file")
  .option(
    "--ai-prompts <file>",
    "write AI fix prompts to JSON file for use with Cursor/Claude/Windsurf",
  )
  .action(async (directory: string, flags: CliFlags) => {
    const isScoreOnly = flags.score;
    const isStructuredOutput =
      !isScoreOnly && flags.output !== undefined && flags.output !== "human";
    const shouldLogProgress = !isScoreOnly && !isStructuredOutput;

    try {
      if (
        flags.output !== undefined &&
        !["human", "json", "markdown"].includes(flags.output)
      ) {
        throw new Error(`Unknown output format: ${flags.output}`);
      }
      const resolvedDirectory = path.resolve(directory);
      const userConfig = loadConfig(resolvedDirectory);

      if (shouldLogProgress) {
        logger.log(`vercel-doctor v${VERSION}`);
        logger.break();
      }

      const isCliOverride = (optionName: string) =>
        program.getOptionValueSource(optionName) === "cli";
      const scanOptions = getScanOptionsFromFlags(
        flags,
        userConfig,
        isCliOverride,
      );

      const shouldSkipPrompts = [
        flags.yes,
        isScoreOnly,
        isStructuredOutput,
        !process.stdin.isTTY,
        process.env.CI,
        process.env.CLAUDECODE,
        process.env.CURSOR_AGENT,
        process.env.CODEX_CI,
        process.env.OPENCODE,
        process.env.AMP_HOME,
      ].some(Boolean);
      const projectDirectories = await selectProjects(
        resolvedDirectory,
        flags.project,
        shouldSkipPrompts,
        shouldLogProgress,
      );

      const effectiveDiff = isCliOverride("diff")
        ? flags.diff
        : userConfig?.diff;
      const explicitBaseBranch =
        typeof effectiveDiff === "string" ? effectiveDiff : undefined;
      const diffInfo = getDiffInfo(resolvedDirectory, explicitBaseBranch);
      const isDiffMode = await resolveDiffMode(
        diffInfo,
        effectiveDiff,
        shouldSkipPrompts,
        !shouldLogProgress,
      );

      logDiffModeMessage(isDiffMode, diffInfo, !shouldLogProgress);

      const allDiagnostics: Diagnostic[] = [];
      const projectResults: ProjectScanResult[] = [];

      for (const projectDirectory of projectDirectories) {
        const { includePaths, shouldSkip } = getIncludePathsForProject(
          projectDirectory,
          isDiffMode,
          explicitBaseBranch,
          !shouldLogProgress,
        );
        if (shouldSkip) {
          continue;
        }

        if (shouldLogProgress) {
          logger.dim(`Scanning ${projectDirectory}...`);
          logger.break();
        }
        const scanResult = await scan(projectDirectory, {
          ...scanOptions,
          includePaths,
          silent: isStructuredOutput,
        });
        projectResults.push({ ...scanResult, directory: projectDirectory });
        allDiagnostics.push(
          ...scanResult.diagnostics.map((diagnostic) => ({
            ...diagnostic,
            filePath: path.relative(
              resolvedDirectory,
              path.resolve(projectDirectory, diagnostic.filePath),
            ),
          })),
        );

        if (shouldLogProgress) {
          logger.break();
        }
      }

      if (isStructuredOutput) {
        printStructuredOutput(
          flags.output,
          projectResults,
          allDiagnostics,
          resolvedDirectory,
          projectDirectories.length === 1,
        );
      }
      if (flags.report) {
        writeReportIfRequested(
          flags.report,
          allDiagnostics,
          path.basename(resolvedDirectory),
        );
      }
      if (flags.aiPrompts) {
        writeAiPromptsIfRequested(flags.aiPrompts, allDiagnostics);
      }

      if (shouldLogProgress && !shouldSkipPrompts) {
        await maybePromptSkillInstall(shouldSkipPrompts);
      }
    } catch (error) {
      handleError(error);
    }
  })
  .addHelpText(
    "after",
    `
${highlighter.dim("Learn more:")}
  ${highlighter.info("https://github.com/Aniket-508/vercel-doctor")}
`,
  );

const main = async () => {
  await program.parseAsync();
};

main();
