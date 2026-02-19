export const SOURCE_FILE_PATTERN = /\.(tsx?|jsx?)$/;

export const JSX_FILE_PATTERN = /\.(tsx|jsx)$/;

export const MILLISECONDS_PER_SECOND = 1000;

export const ERROR_PREVIEW_LENGTH_CHARS = 200;

export const PERFECT_SCORE = 100;

export const SCORE_GOOD_THRESHOLD = 75;

export const SCORE_OK_THRESHOLD = 50;

export const SCORE_BAR_WIDTH_CHARS = 50;

export const SUMMARY_BOX_HORIZONTAL_PADDING_CHARS = 1;

export const SUMMARY_BOX_OUTER_INDENT_CHARS = 2;

export const SCORE_API_URL = "https://www.vercel-doctor.com/api/score";

export const ESTIMATE_SCORE_API_URL = "https://www.vercel-doctor.com/api/estimate-score";

export const SHARE_BASE_URL = "https://www.vercel-doctor.com/share";

export const INSTALL_SKILL_URL = "https://www.vercel-doctor.com/install-skill";

export const GIT_LS_FILES_MAX_BUFFER_BYTES = 50 * 1024 * 1024;

export const OFFLINE_MESSAGE =
  "You are offline, could not calculate score. Reconnect to calculate.";

export const OFFLINE_FLAG_MESSAGE = "Score not calculated. Remove --offline to calculate score.";

export const DEFAULT_BRANCH_CANDIDATES = ["main", "master"];

export const BYTES_PER_KILOBYTE = 1024;

export const KILOBYTES_PER_MEGABYTE = 1024;

export const BYTES_PER_MEGABYTE = BYTES_PER_KILOBYTE * KILOBYTES_PER_MEGABYTE;

export const STATIC_ASSET_CDN_WARNING_THRESHOLD_BYTES = 256 * BYTES_PER_KILOBYTE;

export const PUBLIC_STATIC_ASSET_CDN_WARNING_THRESHOLD_BYTES = 4 * BYTES_PER_KILOBYTE;

export const MAX_STATIC_ASSET_CDN_DIAGNOSTICS_COUNT = 20;

export const STATIC_ASSET_SIZE_DECIMAL_PLACES_COUNT = 2;

export const EDGE_FUNCTION_AWAIT_WARNING_THRESHOLD_COUNT = 2;

export const FLUID_COMPUTE_ROUTE_THRESHOLD_COUNT = 3;

export const SEQUENTIAL_DATABASE_AWAIT_WARNING_THRESHOLD_COUNT = 3;
