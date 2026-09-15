import type { HandleErrorOptions } from "../types.js";

const DEFAULT_HANDLE_ERROR_OPTIONS: HandleErrorOptions = {
  shouldExit: true,
};

export const handleError = (
  error: unknown,
  options: HandleErrorOptions = DEFAULT_HANDLE_ERROR_OPTIONS,
): void => {
  console.error(
    "Something went wrong. Please check the error below for more details.",
  );
  console.error("If the problem persists, please open an issue on GitHub.");
  console.error(error instanceof Error ? error.message : String(error));
  if (options.shouldExit) {
    process.exit(1);
  }
  process.exitCode = 1;
};
