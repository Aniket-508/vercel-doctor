import type { VercelDoctorConfig } from "../types.js";

export const isVercelDoctorConfig = (
  value: unknown,
): value is VercelDoctorConfig => {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }
  for (const key of ["lint", "deadCode", "verbose"]) {
    if (key in value && typeof Reflect.get(value, key) !== "boolean") {
      return false;
    }
  }
  if (
    "diff" in value &&
    typeof value.diff !== "boolean" &&
    typeof value.diff !== "string"
  ) {
    return false;
  }
  if (!("ignore" in value)) {
    return true;
  }
  const { ignore } = value;
  if (typeof ignore !== "object" || ignore === null || Array.isArray(ignore)) {
    return false;
  }
  for (const key of ["rules", "files"]) {
    if (!(key in ignore)) {
      continue;
    }
    const patterns: unknown = Reflect.get(ignore, key);
    if (
      !Array.isArray(patterns) ||
      !patterns.every((pattern) => typeof pattern === "string")
    ) {
      return false;
    }
  }
  return true;
};
