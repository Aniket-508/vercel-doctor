import type { Diagnostic } from "../types.js";
import { isErrorDiagnostic } from "./diagnostic-severity.js";

export const summarizeDiagnostics = (diagnostics: Diagnostic[]) => {
  const affectedFiles = new Set<string>();
  let errorCount = 0;
  let warningCount = 0;

  for (const diagnostic of diagnostics) {
    affectedFiles.add(diagnostic.filePath);

    if (isErrorDiagnostic(diagnostic)) {
      errorCount += 1;
    } else {
      warningCount += 1;
    }
  }

  return {
    errorCount,
    warningCount,
    affectedFileCount: affectedFiles.size,
  };
};
