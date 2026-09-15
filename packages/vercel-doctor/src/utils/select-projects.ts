import path from "node:path";

import type { WorkspacePackage } from "../types.js";
import {
  discoverFrameworkSubprojects,
  listWorkspacePackages,
} from "./discover-project.js";
import { highlighter } from "./highlighter.js";
import { logger } from "./logger.js";
import { prompts } from "./prompts.js";

export const selectProjects = (
  rootDirectory: string,
  projectFlag: string | undefined,
  skipPrompts: boolean,
  shouldLog = true,
): Promise<string[]> => {
  let packages = listWorkspacePackages(rootDirectory);
  if (packages.length === 0) {
    packages = discoverFrameworkSubprojects(rootDirectory);
  }

  if (packages.length === 0) {
    return Promise.resolve([rootDirectory]);
  }
  if (projectFlag) {
    return Promise.resolve(resolveProjectFlag(projectFlag, packages));
  }

  if (packages.length === 1) {
    if (shouldLog) {
      printDiscoveredProjects(packages);
    }
    return Promise.resolve([packages[0].directory]);
  }

  if (skipPrompts) {
    if (shouldLog) {
      printDiscoveredProjects(packages);
    }
    return Promise.resolve(
      packages.map((workspacePackage) => workspacePackage.directory),
    );
  }

  return promptProjectSelection(packages, rootDirectory);
};

const resolveProjectFlag = (
  projectFlag: string,
  workspacePackages: WorkspacePackage[],
): string[] => {
  const requestedNames = projectFlag.split(",").map((name) => name.trim());
  const resolvedDirectories: string[] = [];

  for (const requestedName of requestedNames) {
    const matched = workspacePackages.find(
      (workspacePackage) =>
        workspacePackage.name === requestedName ||
        path.basename(workspacePackage.directory) === requestedName,
    );

    if (!matched) {
      const availableNames = workspacePackages
        .map((workspacePackage) => workspacePackage.name)
        .join(", ");
      throw new Error(
        `Project "${requestedName}" not found. Available: ${availableNames}`,
      );
    }

    resolvedDirectories.push(matched.directory);
  }

  return resolvedDirectories;
};

const printDiscoveredProjects = (packages: WorkspacePackage[]): void => {
  logger.log(
    `${highlighter.success("✔")} Select projects to scan ${highlighter.dim("›")} ${packages.map((workspacePackage) => workspacePackage.name).join(", ")}`,
  );
};

const promptProjectSelection = async (
  workspacePackages: WorkspacePackage[],
  rootDirectory: string,
): Promise<string[]> => {
  const { selectedDirectories } = await prompts({
    choices: workspacePackages.map((workspacePackage) => ({
      description: path.relative(rootDirectory, workspacePackage.directory),
      title: workspacePackage.name,
      value: workspacePackage.directory,
    })),
    message: "Select projects to scan",
    min: 1,
    name: "selectedDirectories",
    type: "multiselect",
  });

  return selectedDirectories;
};
