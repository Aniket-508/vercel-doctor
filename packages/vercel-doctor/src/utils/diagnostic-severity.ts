import type { Diagnostic } from "../types.js";
import { highlighter } from "./highlighter.js";

export const DIAGNOSTIC_SEVERITY_ORDER: Record<Diagnostic["severity"], number> = {
  error: 0,
  warning: 1,
};

export const DIAGNOSTIC_SEVERITY_SYMBOLS: Record<Diagnostic["severity"], string> = {
  error: "✗",
  warning: "⚠",
};

export const DIAGNOSTIC_SEVERITY_MARKDOWN_SYMBOLS: Record<Diagnostic["severity"], string> = {
  error: "❌",
  warning: "⚠️",
};

export const isErrorSeverity = (severity: Diagnostic["severity"]): boolean => severity === "error";

export const isErrorDiagnostic = (diagnostic: Diagnostic): boolean =>
  isErrorSeverity(diagnostic.severity);

export const colorizeDiagnosticSeverity = (
  text: string,
  severity: Diagnostic["severity"],
): string => (isErrorSeverity(severity) ? highlighter.error(text) : highlighter.warn(text));
