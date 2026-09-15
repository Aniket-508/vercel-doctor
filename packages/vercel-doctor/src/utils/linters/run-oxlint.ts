import fs from "node:fs";
import path from "node:path";

import type { LinterRunner } from "../../types.js";
import { runOxlint } from "../run-oxlint.js";

export const oxlintRunner: LinterRunner = {
  detect: (projectDirectory: string) => {
    const packageJsonPath = path.join(projectDirectory, "package.json");
    if (!fs.existsSync(packageJsonPath)) {
      return false;
    }
    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
      const allDeps = {
        ...packageJson.peerDependencies,
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
      };
      return "oxlint" in allDeps;
    } catch {
      return false;
    }
  },
  kind: "oxlint",
  run: (rootDirectory, _projectInfo, options) =>
    runOxlint(
      rootDirectory,
      options.hasTypeScript,
      options.framework,
      options.includePaths,
    ),
};
