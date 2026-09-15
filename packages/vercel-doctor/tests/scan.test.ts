import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterAll, afterEach, describe, expect, it, vi } from "vitest";

import { scan } from "../src/scan.js";

const projectDirectory = fs.mkdtempSync(
  path.join(os.tmpdir(), "vercel-doctor-scan-"),
);
fs.writeFileSync(
  path.join(projectDirectory, "package.json"),
  JSON.stringify({
    dependencies: { next: "16.0.0", react: "19.0.0" },
    name: "scan-project",
  }),
);
fs.mkdirSync(path.join(projectDirectory, "app"));
fs.writeFileSync(
  path.join(projectDirectory, "app/page.tsx"),
  'export const dynamic = "force-dynamic";\nexport default () => <div />;\n',
);

describe("project scan", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });
  afterAll(() => {
    fs.rmSync(projectDirectory, { force: true, recursive: true });
  });
  it("emits parseable JSON containing discovered diagnostics without progress text", async () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    await scan(projectDirectory, {
      deadCode: false,
      lint: false,
      offline: true,
      output: "json",
    });
    const output = JSON.parse(
      consoleSpy.mock.calls.map((args) => args.join(" ")).join("\n"),
    );
    expect(output.diagnostics).toStrictEqual(
      expect.arrayContaining([
        expect.objectContaining({
          filePath: "app/page.tsx",
          rule: "vercel-no-force-dynamic",
        }),
      ]),
    );
    expect(output.scoreResult).toBeNull();
  });

  it("does not expand an explicitly empty diff into a full scan", async () => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    const result = await scan(projectDirectory, {
      includePaths: [],
      offline: true,
      output: "json",
    });
    expect(result.diagnostics).toStrictEqual([]);
  });

  it("keeps clean Markdown scans in Markdown format", async () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    await scan(projectDirectory, {
      includePaths: [],
      offline: true,
      output: "markdown",
    });
    const output = consoleSpy.mock.calls
      .map((args) => args.join(" "))
      .join("\n");
    expect(output.startsWith("# ")).toBeTruthy();
  });

  it("rejects projects without supported framework dependencies", async () => {
    const emptyDirectory = fs.mkdtempSync(
      path.join(os.tmpdir(), "vercel-doctor-no-framework-"),
    );
    try {
      fs.writeFileSync(
        path.join(emptyDirectory, "package.json"),
        JSON.stringify({ name: "empty" }),
      );
      await expect(scan(emptyDirectory, { offline: true })).rejects.toThrow(
        "No framework dependency",
      );
    } finally {
      fs.rmSync(emptyDirectory, { force: true, recursive: true });
    }
  });
});
