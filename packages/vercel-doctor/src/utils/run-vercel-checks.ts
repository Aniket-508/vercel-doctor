import path from "node:path";

import type {
  Diagnostic,
  FrameworkCheckProvider,
  ProjectInfo,
  VercelCheckOptions,
} from "../types.js";
import { discoverProject } from "./discover-project.js";
import {
  buildIncludedPathSet,
  collectGenericDiagnostics,
  collectProjectFilePaths,
  readTextFileSafely,
  shouldInspectPath,
} from "./vercel-checks/generic-checks.js";
import { nextjsCheckProvider } from "./vercel-checks/nextjs-checks.js";
import { nuxtCheckProvider } from "./vercel-checks/nuxt-checks.js";
import { sveltekitCheckProvider } from "./vercel-checks/sveltekit-checks.js";

const FRAMEWORK_CHECK_PROVIDERS: Record<string, FrameworkCheckProvider> = {
  nextjs: nextjsCheckProvider,
  nuxt: nuxtCheckProvider,
  sveltekit: sveltekitCheckProvider,
};

export const runVercelChecks = (
  rootDirectory: string,
  options: VercelCheckOptions = {},
): Diagnostic[] => {
  const diagnostics: Diagnostic[] = [];
  const includedPathSet = buildIncludedPathSet(
    rootDirectory,
    options.includePaths,
  );
  const projectFilePaths = collectProjectFilePaths(rootDirectory);

  collectGenericDiagnostics(
    rootDirectory,
    projectFilePaths,
    includedPathSet,
    diagnostics,
  );

  let projectInfo: ProjectInfo;
  try {
    projectInfo = discoverProject(rootDirectory);
  } catch {
    return diagnostics;
  }

  const provider = FRAMEWORK_CHECK_PROVIDERS[projectInfo.framework];
  if (provider) {
    for (const relativeFilePath of projectFilePaths) {
      if (!shouldInspectPath(relativeFilePath, includedPathSet)) {
        continue;
      }

      const absoluteFilePath = path.join(rootDirectory, relativeFilePath);
      const fileContent = readTextFileSafely(absoluteFilePath);
      if (!fileContent) {
        continue;
      }

      provider.collectFileDiagnostics(
        relativeFilePath,
        fileContent,
        projectInfo,
        diagnostics,
      );
    }

    provider.collectConfigDiagnostics?.(
      rootDirectory,
      projectFilePaths,
      includedPathSet,
      diagnostics,
    );
  }

  return diagnostics;
};
