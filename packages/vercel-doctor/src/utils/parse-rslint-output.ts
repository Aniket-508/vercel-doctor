import path from "node:path";

import { ERROR_PREVIEW_LENGTH_CHARS } from "../constants.js";
import { RULE_CATEGORY_NAMES } from "../rule-metadata.js";
import type { Diagnostic } from "../types.js";

interface RslintDiagnostic {
  filePath: string;
  message: string;
  range?: {
    start?: {
      line: number;
      column: number;
    };
  };
  ruleName: string;
  severity: "error" | "warn";
}

export const parseRslintOutput = (
  stdout: string,
  rootDirectory: string,
): Diagnostic[] => {
  const diagnostics: Diagnostic[] = [];
  for (const outputLine of stdout.split(/\r?\n/)) {
    if (!outputLine.trim()) {
      continue;
    }
    let diagnostic: RslintDiagnostic;
    try {
      diagnostic = JSON.parse(outputLine);
      if (
        !diagnostic ||
        typeof diagnostic.filePath !== "string" ||
        typeof diagnostic.message !== "string" ||
        typeof diagnostic.ruleName !== "string" ||
        (diagnostic.severity !== "error" && diagnostic.severity !== "warn")
      ) {
        throw new Error("Invalid diagnostic");
      }
    } catch (error) {
      throw new Error(
        `Failed to parse rslint output: ${outputLine.slice(0, ERROR_PREVIEW_LENGTH_CHARS)}`,
        { cause: error },
      );
    }
    diagnostics.push({
      category: RULE_CATEGORY_NAMES.OTHER,
      column: diagnostic.range?.start?.column ?? 0,
      filePath: path.isAbsolute(diagnostic.filePath)
        ? path.relative(rootDirectory, diagnostic.filePath)
        : diagnostic.filePath,
      help: "",
      line: diagnostic.range?.start?.line ?? 0,
      message: diagnostic.message,
      plugin: "rslint",
      rule: diagnostic.ruleName,
      severity: diagnostic.severity === "error" ? "error" : "warning",
    });
  }
  return diagnostics;
};
