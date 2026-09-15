import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { filterSourceFiles, getDiffInfo } from "../src/utils/get-diff-files.js";

let projectDirectory: string;

const git = (...args: string[]): string =>
  execFileSync("git", args, {
    cwd: projectDirectory,
    encoding: "utf8",
    stdio: "pipe",
  });

describe("git diff discovery", () => {
  beforeEach(() => {
    projectDirectory = fs.mkdtempSync(
      path.join(os.tmpdir(), "vercel-doctor-diff-"),
    );
    git("init", "-b", "main");
    git("config", "user.email", "test@example.com");
    git("config", "user.name", "Test");
    fs.writeFileSync(
      path.join(projectDirectory, "tracked.ts"),
      "export const value = 1;\n",
    );
    git("add", ".");
    git("-c", "commit.gpgsign=false", "commit", "-m", "initial");
  });

  afterEach(() => {
    fs.rmSync(projectDirectory, { force: true, recursive: true });
  });

  it("retains module-extension configuration files in diff scans", () => {
    expect(
      filterSourceFiles([
        "next.config.mjs",
        "svelte.config.cjs",
        "route.mts",
        "types.cts",
        "README.md",
      ]),
    ).toStrictEqual([
      "next.config.mjs",
      "svelte.config.cjs",
      "route.mts",
      "types.cts",
    ]);
  });
  it("treats base refs as arguments rather than shell commands", () => {
    expect(() =>
      getDiffInfo(projectDirectory, "main; touch injected; #"),
    ).toThrow(Error);
    expect(fs.existsSync(path.join(projectDirectory, "injected"))).toBeFalsy();
  });

  it("includes untracked files and preserves unusual path names", () => {
    const unusualPath = "new café\ncomponent.tsx";
    fs.writeFileSync(path.join(projectDirectory, unusualPath), "export {};\n");
    fs.appendFileSync(
      path.join(projectDirectory, "tracked.ts"),
      "export const changed = true;\n",
    );
    expect(
      getDiffInfo(projectDirectory)?.changedFiles.toSorted(),
    ).toStrictEqual(["tracked.ts", unusualPath].toSorted());
  });

  it("scopes paths to the selected workspace project", () => {
    fs.mkdirSync(path.join(projectDirectory, "packages/app"), {
      recursive: true,
    });
    fs.writeFileSync(
      path.join(projectDirectory, "packages/app/page.tsx"),
      "export {};\n",
    );
    fs.writeFileSync(path.join(projectDirectory, "outside.ts"), "export {};\n");
    expect(
      getDiffInfo(path.join(projectDirectory, "packages/app"))?.changedFiles,
    ).toStrictEqual(["page.tsx"]);
  });

  it("compares detached checkouts against explicit refs", () => {
    git("checkout", "--detach");
    fs.appendFileSync(
      path.join(projectDirectory, "tracked.ts"),
      "export const changed = true;\n",
    );
    expect(getDiffInfo(projectDirectory, "main")?.changedFiles).toStrictEqual([
      "tracked.ts",
    ]);
  });

  it("uses a remote default branch when no matching local branch exists", () => {
    git("update-ref", "refs/remotes/origin/main", "HEAD");
    git("symbolic-ref", "refs/remotes/origin/HEAD", "refs/remotes/origin/main");
    git("checkout", "-b", "feature");
    git("branch", "-D", "main");
    fs.appendFileSync(
      path.join(projectDirectory, "tracked.ts"),
      "export const changed = true;\n",
    );
    expect(getDiffInfo(projectDirectory)?.changedFiles).toStrictEqual([
      "tracked.ts",
    ]);
  });

  it("fails explicitly instead of reporting an invalid base as a clean diff", () => {
    expect(() => getDiffInfo(projectDirectory, "missing-branch")).toThrow(
      Error,
    );
  });
});
