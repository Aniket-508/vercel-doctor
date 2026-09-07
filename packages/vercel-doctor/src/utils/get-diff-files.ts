import { execFileSync } from "node:child_process";

import {
  DEFAULT_BRANCH_CANDIDATES,
  GIT_LS_FILES_MAX_BUFFER_BYTES,
  SOURCE_FILE_PATTERN,
} from "../constants.js";
import type { DiffInfo } from "../types.js";

const runGit = (directory: string, args: string[]): string =>
  execFileSync("git", args, {
    cwd: directory,
    encoding: "utf8",
    maxBuffer: GIT_LS_FILES_MAX_BUFFER_BYTES,
    stdio: "pipe",
  });

const getCurrentBranch = (directory: string): string | null => {
  try {
    return runGit(directory, ["rev-parse", "--abbrev-ref", "HEAD"]).trim();
  } catch {
    return null;
  }
};

const detectDefaultBranch = (directory: string): string | null => {
  try {
    return runGit(directory, ["symbolic-ref", "refs/remotes/origin/HEAD"])
      .trim()
      .replace("refs/remotes/", "");
  } catch {
    for (const candidate of DEFAULT_BRANCH_CANDIDATES) {
      try {
        runGit(directory, ["rev-parse", "--verify", candidate]);
        return candidate;
      } catch {
        continue;
      }
    }
    return null;
  }
};

const getChangedFiles = (directory: string, reference: string): string[] => {
  const trackedFiles = runGit(directory, [
    "diff",
    "--name-only",
    "-z",
    "--diff-filter=ACMR",
    "--relative",
    reference,
    "--",
    ".",
  ])
    .split("\0")
    .filter(Boolean);
  const untrackedFiles = runGit(directory, [
    "ls-files",
    "--others",
    "--exclude-standard",
    "-z",
    "--",
    ".",
  ])
    .split("\0")
    .filter(Boolean);
  return [...new Set([...trackedFiles, ...untrackedFiles])];
};

export const getDiffInfo = (
  directory: string,
  explicitBaseBranch?: string,
): DiffInfo | null => {
  const currentBranch = getCurrentBranch(directory);
  if (!currentBranch) {
    return null;
  }

  const baseBranch = explicitBaseBranch ?? detectDefaultBranch(directory);
  if (!baseBranch) {
    return null;
  }

  try {
    const baseCommit = runGit(directory, [
      "rev-parse",
      "--verify",
      "--end-of-options",
      `${baseBranch}^{commit}`,
    ]).trim();
    const currentCommit = runGit(directory, ["rev-parse", "HEAD"]).trim();
    const isCurrentChanges = baseCommit === currentCommit;
    const reference = isCurrentChanges
      ? currentCommit
      : runGit(directory, ["merge-base", baseCommit, currentCommit]).trim();
    const changedFiles = getChangedFiles(directory, reference);
    return {
      baseBranch,
      changedFiles,
      currentBranch,
      ...(isCurrentChanges ? { isCurrentChanges: true } : {}),
    };
  } catch (error) {
    if (explicitBaseBranch !== undefined) {
      throw new Error(
        `Unable to compare changes with base branch ${explicitBaseBranch}`,
        { cause: error },
      );
    }
    return null;
  }
};

export const filterSourceFiles = (filePaths: string[]): string[] =>
  filePaths.filter((filePath) => SOURCE_FILE_PATTERN.test(filePath));
