import fs from "node:fs";
import type { PackageJson } from "../types.js";

export const readPackageJson = (packageJsonPath: string): PackageJson =>
  JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
