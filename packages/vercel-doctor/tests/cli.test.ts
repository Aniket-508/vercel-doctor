import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

const cliPath = path.resolve(import.meta.dirname, "../dist/cli.js");
let workspaceDirectory: string;

interface ProjectOutput {
  directory: string;
}

const runCli = (...args: string[]) =>
  spawnSync(
    process.execPath,
    [
      cliPath,
      workspaceDirectory,
      "--offline",
      "--no-lint",
      "--no-dead-code",
      "--yes",
      ...args,
    ],
    {
      encoding: "utf8",
      env: { ...process.env, NO_COLOR: "1" },
    },
  );

describe("cli output", () => {
  beforeEach(() => {
    workspaceDirectory = fs.mkdtempSync(
      path.join(os.tmpdir(), "vercel-doctor-cli-"),
    );
    fs.writeFileSync(
      path.join(workspaceDirectory, "package.json"),
      JSON.stringify({
        name: "workspace",
        private: true,
        workspaces: ["packages/*"],
      }),
    );
    for (const projectName of ["first", "second"]) {
      const projectDirectory = path.join(
        workspaceDirectory,
        "packages",
        projectName,
      );
      fs.mkdirSync(path.join(projectDirectory, "app"), { recursive: true });
      fs.writeFileSync(
        path.join(projectDirectory, "package.json"),
        JSON.stringify({
          dependencies: { next: "16.0.0", react: "19.0.0" },
          name: projectName,
        }),
      );
      fs.writeFileSync(
        path.join(projectDirectory, "app/page.tsx"),
        'export const dynamic = "force-dynamic";\nexport default () => <div />;\n',
      );
    }
  });

  afterEach(() => {
    fs.rmSync(workspaceDirectory, { force: true, recursive: true });
  });
  it("emits one parseable JSON document for workspace scans", () => {
    const result = runCli("--output", "json");
    expect(result.status).toBe(0);
    const projects: ProjectOutput[] = JSON.parse(result.stdout);
    expect(
      projects.map((project) => path.basename(project.directory)).toSorted(),
    ).toStrictEqual(["first", "second"]);
  });

  it("keeps single-project JSON output free of progress text", () => {
    const result = runCli("--project", "first", "--output", "json");
    expect(result.status).toBe(0);
    expect(JSON.parse(result.stdout).diagnostics).toStrictEqual(
      expect.arrayContaining([
        expect.objectContaining({
          filePath: "app/page.tsx",
          rule: "vercel-no-force-dynamic",
        }),
      ]),
    );
  });

  it("preserves all workspace projects in reports and AI prompts", () => {
    const reportPath = path.join(workspaceDirectory, "report.md");
    const promptsPath = path.join(workspaceDirectory, "prompts.json");
    const result = runCli(
      "--output",
      "json",
      "--report",
      reportPath,
      "--ai-prompts",
      promptsPath,
    );
    expect(result.status).toBe(0);
    expect(JSON.parse(result.stdout)).toHaveLength(2);
    const report = fs.readFileSync(reportPath, "utf8");
    const prompts = fs.readFileSync(promptsPath, "utf8");
    for (const projectName of ["first", "second"]) {
      expect(report).toContain(`packages/${projectName}/app/page.tsx`);
      expect(prompts).toContain(`packages/${projectName}/app/page.tsx`);
    }
  });

  it("fails when a requested output file cannot be written", () => {
    const result = runCli("--output", "json", "--report", workspaceDirectory);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("EISDIR");
  });

  it("rejects unknown output formats", () => {
    const result = runCli("--output", "yaml");
    expect(result.status).toBe(1);
    expect(result.stdout).toBe("");
  });
});
