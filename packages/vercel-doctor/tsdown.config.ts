import fs from "node:fs";

import { defineConfig } from "tsdown";

const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8")) as {
  version: string;
};

export default defineConfig([
  {
    banner: "#!/usr/bin/env node",
    dts: true,
    entry: {
      cli: "./src/cli.ts",
    },
    env: {
      VERSION: process.env.VERSION ?? packageJson.version,
    },
    external: ["oxlint", "knip", "knip/session"],
    fixedExtension: false,
    platform: "node",
    target: "node22",
  },
  {
    dts: true,
    entry: {
      index: "./src/index.ts",
    },
    external: ["oxlint", "knip", "knip/session"],
    fixedExtension: false,
    platform: "node",
    target: "node22",
  },
  {
    entry: {
      "vercel-doctor-plugin": "./src/plugin/index.ts",
    },
    fixedExtension: false,
    platform: "node",
    target: "node22",
  },
]);
