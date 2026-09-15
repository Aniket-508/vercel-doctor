import fs from "node:fs";
import path from "node:path";

import type { LinterKind } from "../../types.js";
import { readPackageJson } from "../read-package-json.js";

const ESLINT_CONFIG_FILE_PATTERNS = [
  "eslint.config.js",
  "eslint.config.mjs",
  "eslint.config.cjs",
  "eslint.config.ts",
  "eslint.config.mts",
  ".eslintrc.js",
  ".eslintrc.cjs",
  ".eslintrc.mjs",
  ".eslintrc.json",
  ".eslintrc.yaml",
  ".eslintrc.yml",
];

const BIOME_CONFIG_FILE_PATTERNS = ["biome.json", "biome.jsonc"];

const OXLINT_CONFIG_FILE_PATTERNS = [
  "oxlintrc.json",
  ".oxlintrc.json",
  "oxlint.json",
];

const RSLINT_CONFIG_FILE_PATTERNS = [
  "rslint.config.js",
  "rslint.config.mjs",
  "rslint.config.ts",
  "rslint.config.mts",
];

const hasConfigFile = (
  projectDirectory: string,
  patterns: readonly string[],
): boolean =>
  patterns.some((pattern) =>
    fs.existsSync(path.join(projectDirectory, pattern)),
  );

const hasPackageDependency = (
  projectDirectory: string,
  packageName: string,
): boolean => {
  const packageJsonPath = path.join(projectDirectory, "package.json");
  if (!fs.existsSync(packageJsonPath)) {
    return false;
  }

  const packageJson = readPackageJson(packageJsonPath);
  const allDependencies = {
    ...packageJson.peerDependencies,
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
  };

  return packageName in allDependencies;
};

export const detectLinter = (projectDirectory: string): LinterKind => {
  const hasOxlintDependency = hasPackageDependency(projectDirectory, "oxlint");
  const hasOxlintConfig = hasConfigFile(
    projectDirectory,
    OXLINT_CONFIG_FILE_PATTERNS,
  );

  if (hasOxlintDependency || hasOxlintConfig) {
    return "oxlint";
  }

  const hasBiomeDependency = hasPackageDependency(
    projectDirectory,
    "@biomejs/biome",
  );
  const hasBiomeConfig = hasConfigFile(
    projectDirectory,
    BIOME_CONFIG_FILE_PATTERNS,
  );

  if (hasBiomeDependency || hasBiomeConfig) {
    return "biome";
  }

  const hasRslintDependency = hasPackageDependency(
    projectDirectory,
    "@rslint/core",
  );
  const hasRslintConfig = hasConfigFile(
    projectDirectory,
    RSLINT_CONFIG_FILE_PATTERNS,
  );

  if (hasRslintDependency || hasRslintConfig) {
    return "rslint";
  }

  const hasEslintDependency = hasPackageDependency(projectDirectory, "eslint");
  const hasEslintConfig = hasConfigFile(
    projectDirectory,
    ESLINT_CONFIG_FILE_PATTERNS,
  );

  if (hasEslintDependency || hasEslintConfig) {
    return "eslint";
  }

  return "none";
};
