import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

import {
  GIT_LS_FILES_MAX_BUFFER_BYTES,
  SOURCE_FILE_PATTERN,
} from "../constants.js";
import type {
  DependencyInfo,
  Framework,
  PackageJson,
  ProjectInfo,
  WorkspacePackage,
} from "../types.js";
import { getSemverMajorVersion } from "./get-semver-major-version.js";
import { readPackageJson } from "./read-package-json.js";

const FRAMEWORK_PACKAGES: Record<string, Framework> = {
  "@remix-run/react": "remix",
  "@sveltejs/kit": "sveltekit",
  gatsby: "gatsby",
  next: "nextjs",
  nuxt: "nuxt",
  "react-scripts": "cra",
  vite: "vite",
};

const FRAMEWORK_DISPLAY_NAMES: Record<Framework, string> = {
  cra: "Create React App",
  gatsby: "Gatsby",
  nextjs: "Next.js",
  nuxt: "Nuxt",
  remix: "Remix",
  sveltekit: "SvelteKit",
  unknown: "Unknown",
  vite: "Vite",
};

export const formatFrameworkName = (framework: Framework): string =>
  FRAMEWORK_DISPLAY_NAMES[framework];

const countSourceFiles = (rootDirectory: string): number => {
  const result = spawnSync(
    "git",
    ["ls-files", "-z", "--cached", "--others", "--exclude-standard"],
    {
      cwd: rootDirectory,
      encoding: "utf8",
      maxBuffer: GIT_LS_FILES_MAX_BUFFER_BYTES,
    },
  );

  if (result.error || result.status !== 0) {
    return 0;
  }

  return result.stdout
    .split("\0")
    .filter(
      (filePath) => filePath.length > 0 && SOURCE_FILE_PATTERN.test(filePath),
    ).length;
};

const collectAllDependencies = (
  packageJson: PackageJson,
): Record<string, string> => ({
  ...packageJson.peerDependencies,
  ...packageJson.dependencies,
  ...packageJson.devDependencies,
});

const detectFramework = (dependencies: Record<string, string>): Framework => {
  for (const [packageName, frameworkName] of Object.entries(
    FRAMEWORK_PACKAGES,
  )) {
    if (dependencies[packageName]) {
      return frameworkName;
    }
  }
  return "unknown";
};

const extractDependencyInfo = (packageJson: PackageJson): DependencyInfo => {
  const allDependencies = collectAllDependencies(packageJson);
  const nextVersion = allDependencies.next ?? null;
  return {
    framework: detectFramework(allDependencies),
    nextMajorVersion: getSemverMajorVersion(nextVersion),
    nextVersion,
    reactVersion: allDependencies.react ?? null,
    svelteVersion: allDependencies.svelte ?? null,
    vueVersion: allDependencies.vue ?? null,
  };
};

const parsePnpmWorkspacePatterns = (rootDirectory: string): string[] => {
  const workspacePath = path.join(rootDirectory, "pnpm-workspace.yaml");
  if (!fs.existsSync(workspacePath)) {
    return [];
  }

  const content = fs.readFileSync(workspacePath, "utf8");
  const patterns: string[] = [];
  let isInsidePackagesBlock = false;

  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (trimmed === "packages:") {
      isInsidePackagesBlock = true;
      continue;
    }
    if (isInsidePackagesBlock && trimmed.startsWith("-")) {
      patterns.push(trimmed.replace(/^-\s*/, "").replaceAll(/["']/g, ""));
    } else if (
      isInsidePackagesBlock &&
      trimmed.length > 0 &&
      !trimmed.startsWith("#")
    ) {
      isInsidePackagesBlock = false;
    }
  }

  return patterns;
};

const getWorkspacePatterns = (
  rootDirectory: string,
  packageJson: PackageJson,
): string[] => {
  const pnpmPatterns = parsePnpmWorkspacePatterns(rootDirectory);
  if (pnpmPatterns.length > 0) {
    return pnpmPatterns;
  }

  if (Array.isArray(packageJson.workspaces)) {
    return packageJson.workspaces;
  }

  if (packageJson.workspaces?.packages) {
    return packageJson.workspaces.packages;
  }

  return [];
};

const resolveWorkspaceDirectories = (
  rootDirectory: string,
  patterns: string[],
): string[] => {
  const includedPatterns = patterns.filter(
    (pattern) => !pattern.startsWith("!"),
  );
  const excludedPatterns = patterns
    .filter((pattern) => pattern.startsWith("!"))
    .map((pattern) => pattern.slice(1));

  return fs
    .globSync(includedPatterns, {
      cwd: rootDirectory,
      exclude: ["**/node_modules/**", "**/.git/**", ...excludedPatterns],
    })
    .map((directory) => path.resolve(rootDirectory, directory))
    .filter(
      (directory) =>
        fs.statSync(directory).isDirectory() &&
        fs.existsSync(path.join(directory, "package.json")),
    );
};

const isMonorepoRoot = (directory: string): boolean => {
  if (fs.existsSync(path.join(directory, "pnpm-workspace.yaml"))) {
    return true;
  }
  const packageJsonPath = path.join(directory, "package.json");
  if (!fs.existsSync(packageJsonPath)) {
    return false;
  }
  const packageJson = readPackageJson(packageJsonPath);
  return (
    Array.isArray(packageJson.workspaces) ||
    Boolean(packageJson.workspaces?.packages)
  );
};

const findMonorepoRoot = (startDirectory: string): string | null => {
  let currentDirectory = path.dirname(startDirectory);

  while (currentDirectory !== path.dirname(currentDirectory)) {
    if (isMonorepoRoot(currentDirectory)) {
      return currentDirectory;
    }
    currentDirectory = path.dirname(currentDirectory);
  }

  return null;
};

const findDependencyInfoFromMonorepoRoot = (
  directory: string,
): DependencyInfo => {
  const monorepoRoot = findMonorepoRoot(directory);
  if (!monorepoRoot) {
    return {
      framework: "unknown",
      nextMajorVersion: null,
      nextVersion: null,
      reactVersion: null,
      svelteVersion: null,
      vueVersion: null,
    };
  }

  const rootPackageJsonPath = path.join(monorepoRoot, "package.json");
  if (!fs.existsSync(rootPackageJsonPath)) {
    return {
      framework: "unknown",
      nextMajorVersion: null,
      nextVersion: null,
      reactVersion: null,
      svelteVersion: null,
      vueVersion: null,
    };
  }
  return extractDependencyInfo(readPackageJson(rootPackageJsonPath));
};

const findDependencyInfoInWorkspaces = (
  rootDirectory: string,
  packageJson: PackageJson,
): DependencyInfo => {
  const patterns = getWorkspacePatterns(rootDirectory, packageJson);
  const result: DependencyInfo = {
    framework: "unknown",
    nextMajorVersion: null,
    nextVersion: null,
    reactVersion: null,
    svelteVersion: null,
    vueVersion: null,
  };

  const directories = resolveWorkspaceDirectories(rootDirectory, patterns);
  for (const workspaceDirectory of directories) {
    const workspacePackageJson = readPackageJson(
      path.join(workspaceDirectory, "package.json"),
    );
    const info = extractDependencyInfo(workspacePackageJson);

    if (info.reactVersion && !result.reactVersion) {
      result.reactVersion = info.reactVersion;
    }
    if (info.vueVersion && !result.vueVersion) {
      result.vueVersion = info.vueVersion;
    }
    if (info.svelteVersion && !result.svelteVersion) {
      result.svelteVersion = info.svelteVersion;
    }
    if (info.framework !== "unknown" && result.framework === "unknown") {
      result.framework = info.framework;
    }
    if (info.nextVersion && !result.nextVersion) {
      result.nextVersion = info.nextVersion;
    }
    if (info.nextMajorVersion !== null && result.nextMajorVersion === null) {
      result.nextMajorVersion = info.nextMajorVersion;
    }

    if (
      result.framework !== "unknown" &&
      result.nextVersion &&
      result.nextMajorVersion !== null
    ) {
      return result;
    }
  }

  return result;
};

const hasFrameworkDependency = (packageJson: PackageJson): boolean => {
  const allDependencies = collectAllDependencies(packageJson);
  return Object.keys(allDependencies).some(
    (packageName) =>
      packageName === "next" ||
      packageName === "nuxt" ||
      packageName === "@sveltejs/kit" ||
      packageName.includes("react") ||
      packageName.includes("vue") ||
      packageName.includes("svelte"),
  );
};

export const discoverFrameworkSubprojects = (
  rootDirectory: string,
): WorkspacePackage[] => {
  if (
    !fs.existsSync(rootDirectory) ||
    !fs.statSync(rootDirectory).isDirectory()
  ) {
    return [];
  }

  const entries = fs.readdirSync(rootDirectory, { withFileTypes: true });
  const packages: WorkspacePackage[] = [];

  for (const entry of entries) {
    if (
      !entry.isDirectory() ||
      entry.name.startsWith(".") ||
      entry.name === "node_modules"
    ) {
      continue;
    }

    const subdirectory = path.join(rootDirectory, entry.name);
    const packageJsonPath = path.join(subdirectory, "package.json");
    if (!fs.existsSync(packageJsonPath)) {
      continue;
    }

    const packageJson = readPackageJson(packageJsonPath);
    if (!hasFrameworkDependency(packageJson)) {
      continue;
    }

    const name = packageJson.name ?? entry.name;
    packages.push({ directory: subdirectory, name });
  }

  return packages;
};

export const listWorkspacePackages = (
  rootDirectory: string,
): WorkspacePackage[] => {
  const packageJsonPath = path.join(rootDirectory, "package.json");
  if (!fs.existsSync(packageJsonPath)) {
    return [];
  }

  const packageJson = readPackageJson(packageJsonPath);
  const patterns = getWorkspacePatterns(rootDirectory, packageJson);
  if (patterns.length === 0) {
    return [];
  }

  const packages: WorkspacePackage[] = [];

  const directories = resolveWorkspaceDirectories(rootDirectory, patterns);
  for (const workspaceDirectory of directories) {
    const workspacePackageJson = readPackageJson(
      path.join(workspaceDirectory, "package.json"),
    );

    if (!hasFrameworkDependency(workspacePackageJson)) {
      continue;
    }

    const name = workspacePackageJson.name ?? path.basename(workspaceDirectory);
    packages.push({ directory: workspaceDirectory, name });
  }

  return packages;
};

const mergeDependencyInfo = (
  current: DependencyInfo,
  source: DependencyInfo,
): DependencyInfo => ({
  framework:
    current.framework === "unknown" ? source.framework : current.framework,
  nextMajorVersion: current.nextMajorVersion ?? source.nextMajorVersion ?? null,
  nextVersion: current.nextVersion ?? source.nextVersion ?? null,
  reactVersion: current.reactVersion ?? source.reactVersion ?? null,
  svelteVersion: current.svelteVersion ?? source.svelteVersion ?? null,
  vueVersion: current.vueVersion ?? source.vueVersion ?? null,
});

const isDependencyInfoComplete = (info: DependencyInfo): boolean =>
  Boolean(
    (info.reactVersion || info.vueVersion || info.svelteVersion) &&
    info.framework !== "unknown" &&
    info.nextVersion &&
    info.nextMajorVersion !== null,
  );

export const discoverProject = (directory: string): ProjectInfo => {
  const packageJsonPath = path.join(directory, "package.json");
  if (!fs.existsSync(packageJsonPath)) {
    throw new Error(`No package.json found in ${directory}`);
  }

  const packageJson = readPackageJson(packageJsonPath);
  let dependencyInfo = extractDependencyInfo(packageJson);

  if (!isDependencyInfoComplete(dependencyInfo)) {
    dependencyInfo = mergeDependencyInfo(
      dependencyInfo,
      findDependencyInfoInWorkspaces(directory, packageJson),
    );
  }

  if (!isDependencyInfoComplete(dependencyInfo) && !isMonorepoRoot(directory)) {
    dependencyInfo = mergeDependencyInfo(
      dependencyInfo,
      findDependencyInfoFromMonorepoRoot(directory),
    );
  }

  const {
    framework,
    nextMajorVersion,
    nextVersion,
    reactVersion,
    svelteVersion,
    vueVersion,
  } = dependencyInfo;
  const projectName = packageJson.name ?? path.basename(directory);
  const hasTypeScript = fs.existsSync(path.join(directory, "tsconfig.json"));
  const sourceFileCount = countSourceFiles(directory);

  return {
    framework,
    hasTypeScript,
    nextMajorVersion,
    nextVersion,
    projectName,
    reactVersion,
    rootDirectory: directory,
    sourceFileCount,
    svelteVersion,
    vueVersion,
  };
};
