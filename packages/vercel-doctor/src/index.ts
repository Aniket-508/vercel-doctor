import path from "node:path";
import { performance } from "node:perf_hooks";

import type {
  Diagnostic,
  DiffInfo,
  ProjectInfo,
  VercelDoctorConfig,
  ScoreResult,
} from "./types.js";
import { calculateScore } from "./utils/calculate-score.js";
import { discoverProject } from "./utils/discover-project.js";
import { filterIgnoredDiagnostics } from "./utils/filter-diagnostics.js";
import {
  detectLinter,
  oxlintRunner,
  eslintRunner,
  biomeRunner,
  rslintRunner,
} from "./utils/linters/index.js";
import { loadConfig } from "./utils/load-config.js";
import { runKnip } from "./utils/run-knip.js";
import { runVercelChecks } from "./utils/run-vercel-checks.js";

export type {
  Diagnostic,
  DiffInfo,
  ProjectInfo,
  VercelDoctorConfig,
  ScoreResult,
};
export { getDiffInfo, filterSourceFiles } from "./utils/get-diff-files.js";

export interface DiagnoseOptions {
  lint?: boolean;
  deadCode?: boolean;
  includePaths?: string[];
}

export interface DiagnoseResult {
  diagnostics: Diagnostic[];
  score: ScoreResult | null;
  project: ProjectInfo;
  elapsedMilliseconds: number;
}

const LINTER_RUNNERS = [oxlintRunner, biomeRunner, rslintRunner, eslintRunner];

const resolveLinterRunner = (projectDirectory: string) => {
  const detectedKind = detectLinter(projectDirectory);
  return LINTER_RUNNERS.find((runner) => runner.kind === detectedKind) ?? null;
};

export const diagnose = async (
  directory: string,
  options: DiagnoseOptions = {},
): Promise<DiagnoseResult> => {
  const { includePaths = [] } = options;
  const isDiffMode = options.includePaths !== undefined;

  const startTime = performance.now();
  const resolvedDirectory = path.resolve(directory);
  const projectInfo = discoverProject(resolvedDirectory);
  const userConfig = loadConfig(resolvedDirectory);

  const effectiveLint = options.lint ?? userConfig?.lint ?? true;
  const effectiveDeadCode = options.deadCode ?? userConfig?.deadCode ?? true;

  if (
    !projectInfo.reactVersion &&
    !projectInfo.vueVersion &&
    !projectInfo.svelteVersion
  ) {
    throw new Error(
      "No framework dependency (React, Vue, or Svelte) found in package.json",
    );
  }

  const linterRunner = resolveLinterRunner(resolvedDirectory);

  const runLint = async (): Promise<Diagnostic[]> => {
    if (!effectiveLint || !linterRunner) {
      return [];
    }
    try {
      return await linterRunner.run(resolvedDirectory, projectInfo, {
        framework: projectInfo.framework,
        hasTypeScript: projectInfo.hasTypeScript,
        includePaths: options.includePaths,
      });
    } catch (error: unknown) {
      console.error("Lint failed:", error);
      return [];
    }
  };

  const runDeadCode = async (): Promise<Diagnostic[]> => {
    if (!effectiveDeadCode || isDiffMode) {
      return [];
    }
    try {
      return await runKnip(resolvedDirectory);
    } catch (error: unknown) {
      console.error("Dead code analysis failed:", error);
      return [];
    }
  };

  const runVercelChecksSafe = (): Diagnostic[] => {
    try {
      return runVercelChecks(resolvedDirectory, {
        includePaths: isDiffMode ? includePaths : undefined,
      });
    } catch (error: unknown) {
      console.error("Vercel optimization checks failed:", error);
      return [];
    }
  };

  const [lintDiagnostics, deadCodeDiagnostics, vercelDiagnostics] =
    await Promise.all([
      runLint(),
      runDeadCode(),
      Promise.resolve(runVercelChecksSafe()),
    ]);
  const allDiagnostics = [
    ...lintDiagnostics,
    ...deadCodeDiagnostics,
    ...vercelDiagnostics,
  ];
  const diagnostics = userConfig
    ? filterIgnoredDiagnostics(allDiagnostics, userConfig)
    : allDiagnostics;

  const elapsedMilliseconds = performance.now() - startTime;
  const score = await calculateScore(diagnostics);

  return {
    diagnostics,
    elapsedMilliseconds,
    project: projectInfo,
    score,
  };
};
