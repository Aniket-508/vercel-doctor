import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it, vi } from "vitest";

import {
  discoverProject,
  listWorkspacePackages,
} from "../src/utils/discover-project.js";
import { logger } from "../src/utils/logger.js";
import { selectProjects } from "../src/utils/select-projects.js";

const temporaryDirectories: string[] = [];
const createWorkspace = (patterns: string[]) => {
  const directory = fs.mkdtempSync(
    path.join(os.tmpdir(), "vercel-doctor-workspaces-"),
  );
  temporaryDirectories.push(directory);
  fs.writeFileSync(
    path.join(directory, "package.json"),
    JSON.stringify({ name: "workspace", workspaces: patterns }),
  );
  return directory;
};

const addPackage = (
  rootDirectory: string,
  relativeDirectory: string,
  dependencies?: Record<string, string>,
) => {
  const directory = path.join(rootDirectory, relativeDirectory);
  fs.mkdirSync(directory, { recursive: true });
  fs.writeFileSync(
    path.join(directory, "package.json"),
    JSON.stringify({
      dependencies: dependencies ?? { react: "^19.0.0" },
      name: relativeDirectory,
    }),
  );
  return directory;
};

describe("workspace discovery and selection", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    for (const directory of temporaryDirectories.splice(0)) {
      fs.rmSync(directory, { force: true, recursive: true });
    }
  });
  it("respects glob suffixes, recursive packages, exclusions and overlapping patterns", () => {
    const directory = createWorkspace([
      "apps/*-web",
      "packages/**",
      "packages/ui",
      "!packages/legacy",
    ]);
    const web = addPackage(directory, "apps/store-web");
    addPackage(directory, "apps/admin");
    const nested = addPackage(directory, "packages/group/nested");
    const shared = addPackage(directory, "packages/ui");
    addPackage(directory, "packages/legacy");
    expect(
      listWorkspacePackages(directory)
        .map((workspace) => workspace.directory)
        .toSorted(),
    ).toStrictEqual([web, nested, shared].toSorted());
  });

  it("does not inherit a sibling application's framework", () => {
    const directory = createWorkspace(["apps/*", "packages/*"]);
    addPackage(directory, "apps/web", { next: "^16.0.0", react: "^19.0.0" });
    const library = addPackage(directory, "packages/ui");
    expect(discoverProject(library)).toMatchObject({
      framework: "unknown",
      nextMajorVersion: null,
      nextVersion: null,
      reactVersion: "^19.0.0",
    });
  });

  it("validates explicit project names even when only one project exists", () => {
    const directory = createWorkspace(["apps/*"]);
    addPackage(directory, "apps/web");
    expect(() => selectProjects(directory, "missing", true)).toThrow(
      /not found/,
    );
  });

  it("can select projects without polluting machine-readable output", async () => {
    const log = vi.spyOn(logger, "log").mockImplementation(() => {});
    const directory = createWorkspace(["apps/*"]);
    const web = addPackage(directory, "apps/web");
    await expect(
      selectProjects(directory, undefined, true, false),
    ).resolves.toStrictEqual([web]);
    const admin = addPackage(directory, "apps/admin");
    const selectedProjects = await selectProjects(
      directory,
      undefined,
      true,
      false,
    );
    expect(selectedProjects.toSorted()).toStrictEqual([web, admin].toSorted());
    expect(log).not.toHaveBeenCalled();
  });
});
