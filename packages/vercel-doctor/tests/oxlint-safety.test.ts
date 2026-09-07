import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { discoverProject } from "../src/utils/discover-project.js";
import { oxlintRunner } from "../src/utils/linters/run-oxlint.js";
import { runOxlint } from "../src/utils/run-oxlint.js";

const temporaryDirectories: string[] = [];
const createProject = () => {
  const directory = fs.mkdtempSync(
    path.join(os.tmpdir(), "vercel-doctor-oxlint-test-"),
  );
  temporaryDirectories.push(directory);
  fs.writeFileSync(
    path.join(directory, "package.json"),
    JSON.stringify({ name: "runner-regression" }),
  );
  return directory;
};

const sequentialFetches = `export async function loadData() {
  const users = await fetch("/users");
  const posts = await fetch("/posts");
  const comments = await fetch("/comments");
  return { users, posts, comments };
}`;

describe("oxlint scan safety", () => {
  afterEach(() => {
    for (const directory of temporaryDirectories.splice(0)) {
      fs.rmSync(directory, { force: true, recursive: true });
    }
  });
  it("reports plain TypeScript diagnostics through the selected runner", async () => {
    const directory = createProject();
    fs.writeFileSync(path.join(directory, "load.ts"), sequentialFetches);
    const diagnostics = await oxlintRunner.run(
      directory,
      discoverProject(directory),
      {
        framework: "unknown",
        hasTypeScript: false,
        includePaths: ["load.ts"],
      },
    );
    expect(diagnostics).toContainEqual(
      expect.objectContaining({ filePath: "load.ts", rule: "async-parallel" }),
    );
  });

  it("never rewrites source files containing disable directives", async () => {
    const directory = createProject();
    const result = spawnSync("git", ["init", "--quiet"], { cwd: directory });
    expect(result.status).toBe(0);
    const filePath = path.join(directory, "load.tsx");
    const source = `/* eslint-disable */\n${sequentialFetches}`;
    fs.writeFileSync(filePath, source);
    fs.utimesSync(filePath, new Date(0), new Date(0));
    const originalModifiedTime = fs.statSync(filePath).mtimeMs;
    await runOxlint(directory, false, "unknown");
    expect(fs.readFileSync(filePath, "utf8")).toBe(source);
    expect(fs.statSync(filePath).mtimeMs).toBe(originalModifiedTime);
  });

  it("isolates simultaneous scans and honors empty scopes", async () => {
    const directories = [createProject(), createProject()];
    for (const directory of directories) {
      fs.writeFileSync(path.join(directory, "load.ts"), sequentialFetches);
    }
    const results = await Promise.all(
      directories.map((directory) => runOxlint(directory, false, "unknown")),
    );
    for (const diagnostics of results) {
      expect(diagnostics).toContainEqual(
        expect.objectContaining({
          filePath: "load.ts",
          rule: "async-parallel",
        }),
      );
    }
    await expect(
      runOxlint(directories[0], false, "unknown", []),
    ).resolves.toStrictEqual([]);
  });

  it("distinguishes SvelteKit server values from types and similarly named directories", async () => {
    const directory = createProject();
    fs.writeFileSync(
      path.join(directory, "+page.ts"),
      `
import type { Secret } from "$lib/server/secrets";
import { type SecretShape } from "$lib/server/shapes";
import { publicValue } from "$lib/serverless/public";
import { secretValue } from "$lib/server/secrets";
export const load = () => ({ publicValue, secretValue });
`,
    );
    const diagnostics = await runOxlint(directory, false, "sveltekit");
    const serverImports = diagnostics.filter(
      (diagnostic) =>
        diagnostic.rule === "sveltekit-server-import-in-client-load",
    );
    expect(serverImports).toHaveLength(1);
    expect(serverImports[0]).toMatchObject({ filePath: "+page.ts", line: 5 });
  });
});
