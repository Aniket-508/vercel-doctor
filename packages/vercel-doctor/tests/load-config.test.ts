import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { loadConfig } from "../src/utils/load-config.js";

const tempRootDirectory = fs.mkdtempSync(
  path.join(os.tmpdir(), "vercel-doctor-config-test-"),
);

describe("load config", () => {
  afterAll(() => {
    fs.rmSync(tempRootDirectory, { force: true, recursive: true });
  });

  describe(loadConfig, () => {
    describe("vercel-doctor.config.json", () => {
      let configDirectory: string;

      beforeAll(() => {
        configDirectory = path.join(tempRootDirectory, "with-config-file");
        fs.mkdirSync(configDirectory, { recursive: true });
        fs.writeFileSync(
          path.join(configDirectory, "vercel-doctor.config.json"),
          JSON.stringify({
            ignore: {
              files: ["src/generated/**"],
              rules: ["react/no-danger", "knip/exports"],
            },
          }),
        );
      });

      it("loads config from vercel-doctor.config.json", () => {
        const config = loadConfig(configDirectory);
        expect(config).toStrictEqual({
          ignore: {
            files: ["src/generated/**"],
            rules: ["react/no-danger", "knip/exports"],
          },
        });
      });
    });

    describe("package.json vercelDoctor key", () => {
      let packageJsonDirectory: string;

      beforeAll(() => {
        packageJsonDirectory = path.join(
          tempRootDirectory,
          "with-package-json-config",
        );
        fs.mkdirSync(packageJsonDirectory, { recursive: true });
        fs.writeFileSync(
          path.join(packageJsonDirectory, "package.json"),
          JSON.stringify({
            name: "test-project",
            vercelDoctor: {
              ignore: {
                rules: ["jsx-a11y/no-autofocus"],
              },
            },
          }),
        );
      });

      it("loads config from package.json vercelDoctor key", () => {
        const config = loadConfig(packageJsonDirectory);
        expect(config).toStrictEqual({
          ignore: {
            rules: ["jsx-a11y/no-autofocus"],
          },
        });
      });
    });

    describe("config file takes precedence", () => {
      let precedenceDirectory: string;

      beforeAll(() => {
        precedenceDirectory = path.join(tempRootDirectory, "precedence");
        fs.mkdirSync(precedenceDirectory, { recursive: true });
        fs.writeFileSync(
          path.join(precedenceDirectory, "vercel-doctor.config.json"),
          JSON.stringify({ ignore: { rules: ["from-config-file"] } }),
        );
        fs.writeFileSync(
          path.join(precedenceDirectory, "package.json"),
          JSON.stringify({
            name: "test",
            vercelDoctor: { ignore: { rules: ["from-package-json"] } },
          }),
        );
      });

      it("prefers vercel-doctor.config.json over package.json", () => {
        const config = loadConfig(precedenceDirectory);
        expect(config?.ignore?.rules).toStrictEqual(["from-config-file"]);
      });
    });

    describe("no config", () => {
      let emptyDirectory: string;

      beforeAll(() => {
        emptyDirectory = path.join(tempRootDirectory, "no-config");
        fs.mkdirSync(emptyDirectory, { recursive: true });
      });

      it("returns null when no config is found", () => {
        const config = loadConfig(emptyDirectory);
        expect(config).toBeNull();
      });
    });

    describe("scan options in config", () => {
      let optionsDirectory: string;

      beforeAll(() => {
        optionsDirectory = path.join(tempRootDirectory, "with-scan-options");
        fs.mkdirSync(optionsDirectory, { recursive: true });
        fs.writeFileSync(
          path.join(optionsDirectory, "vercel-doctor.config.json"),
          JSON.stringify({
            deadCode: false,
            diff: "main",
            ignore: { rules: ["react/no-danger"] },
            lint: true,
            verbose: true,
          }),
        );
      });

      it("loads scan options alongside ignore config", () => {
        const config = loadConfig(optionsDirectory);
        expect(config).toStrictEqual({
          deadCode: false,
          diff: "main",
          ignore: { rules: ["react/no-danger"] },
          lint: true,
          verbose: true,
        });
      });

      it("loads diff as boolean", () => {
        const boolDiffDirectory = path.join(
          tempRootDirectory,
          "with-bool-diff",
        );
        fs.mkdirSync(boolDiffDirectory, { recursive: true });
        fs.writeFileSync(
          path.join(boolDiffDirectory, "vercel-doctor.config.json"),
          JSON.stringify({ diff: true }),
        );
        const config = loadConfig(boolDiffDirectory);
        expect(config?.diff).toBeTruthy();
      });
    });

    describe("invalid config", () => {
      let invalidJsonDirectory: string;
      let nonObjectDirectory: string;

      beforeAll(() => {
        invalidJsonDirectory = path.join(tempRootDirectory, "invalid-json");
        fs.mkdirSync(invalidJsonDirectory, { recursive: true });
        fs.writeFileSync(
          path.join(invalidJsonDirectory, "vercel-doctor.config.json"),
          "not valid json{{{",
        );

        nonObjectDirectory = path.join(tempRootDirectory, "non-object-config");
        fs.mkdirSync(nonObjectDirectory, { recursive: true });
        fs.writeFileSync(
          path.join(nonObjectDirectory, "vercel-doctor.config.json"),
          JSON.stringify([1, 2, 3]),
        );
      });
      it("ignores invalid option values instead of crashing diagnostic filtering", () => {
        const malformedDirectory = path.join(
          tempRootDirectory,
          "invalid-options",
        );
        fs.mkdirSync(malformedDirectory, { recursive: true });
        const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
        try {
          fs.writeFileSync(
            path.join(malformedDirectory, "vercel-doctor.config.json"),
            JSON.stringify({ ignore: { files: [42] }, lint: "false" }),
          );
          expect(loadConfig(malformedDirectory)).toBeNull();
          fs.rmSync(path.join(malformedDirectory, "vercel-doctor.config.json"));
          fs.writeFileSync(
            path.join(malformedDirectory, "package.json"),
            JSON.stringify({ vercelDoctor: { ignore: { files: [42] } } }),
          );
          expect(loadConfig(malformedDirectory)).toBeNull();
        } finally {
          warnSpy.mockRestore();
        }
      });

      it("returns null and warns for malformed JSON", () => {
        const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
        const config = loadConfig(invalidJsonDirectory);
        expect(config).toBeNull();
        warnSpy.mockRestore();
      });

      it("returns null and warns when config is not an object", () => {
        const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
        const config = loadConfig(nonObjectDirectory);
        expect(config).toBeNull();
        warnSpy.mockRestore();
      });

      it("ignores non-object vercelDoctor key in package.json", () => {
        const arrayConfigDirectory = path.join(
          tempRootDirectory,
          "array-pkg-config",
        );
        fs.mkdirSync(arrayConfigDirectory, { recursive: true });
        fs.writeFileSync(
          path.join(arrayConfigDirectory, "package.json"),
          JSON.stringify({ name: "test", vercelDoctor: "not-an-object" }),
        );
        const config = loadConfig(arrayConfigDirectory);
        expect(config).toBeNull();
      });
    });
  });
});
