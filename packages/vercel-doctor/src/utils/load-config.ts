import fs from "node:fs";
import path from "node:path";

import type { VercelDoctorConfig } from "../types.js";
import { isVercelDoctorConfig } from "./is-vercel-doctor-config.js";

const CONFIG_FILENAME = "vercel-doctor.config.json";
const PACKAGE_JSON_CONFIG_KEY = "vercelDoctor";

export const loadConfig = (
  rootDirectory: string,
): VercelDoctorConfig | null => {
  const configFilePath = path.join(rootDirectory, CONFIG_FILENAME);

  if (fs.existsSync(configFilePath)) {
    try {
      const fileContent = fs.readFileSync(configFilePath, "utf8");
      const parsed: unknown = JSON.parse(fileContent);
      if (!isVercelDoctorConfig(parsed)) {
        console.warn(
          `Warning: ${CONFIG_FILENAME} must be a JSON object with valid option values, ignoring.`,
        );
        return null;
      }
      return parsed;
    } catch (error) {
      console.warn(
        `Warning: Failed to parse ${CONFIG_FILENAME}: ${error instanceof Error ? error.message : String(error)}`,
      );
      return null;
    }
  }

  const packageJsonPath = path.join(rootDirectory, "package.json");
  if (fs.existsSync(packageJsonPath)) {
    try {
      const fileContent = fs.readFileSync(packageJsonPath, "utf8");
      const packageJson = JSON.parse(fileContent);
      const embeddedConfig = packageJson[PACKAGE_JSON_CONFIG_KEY];
      if (isVercelDoctorConfig(embeddedConfig)) {
        return embeddedConfig;
      }
    } catch {
      return null;
    }
  }

  return null;
};
