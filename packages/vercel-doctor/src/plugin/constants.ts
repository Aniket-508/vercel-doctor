export const SEQUENTIAL_AWAIT_THRESHOLD = 3;

export const PAGE_OR_LAYOUT_FILE_PATTERN = /\/(page|layout)\.(tsx?|jsx?)$/;

export const TEST_FILE_PATTERN = /\.(?:test|spec|stories)\.[tj]sx?$/;
export const OG_ROUTE_PATTERN = /\/og\b/i;

export const PAGES_DIRECTORY_PATTERN = /\/pages\//;

export const ROUTE_HANDLER_FILE_PATTERN = /\/route\.(tsx?|jsx?)$/;

export const MUTATION_METHOD_NAMES = new Set([
  "create",
  "insert",
  "insertInto",
  "update",
  "upsert",
  "delete",
  "remove",
  "destroy",
  "set",
  "append",
]);

export const MUTATING_HTTP_METHODS = new Set(["POST", "PUT", "DELETE", "PATCH"]);

export const MUTATING_ROUTE_SEGMENTS = new Set([
  "logout",
  "log-out",
  "signout",
  "sign-out",
  "unsubscribe",
  "delete",
  "remove",
  "revoke",
  "cancel",
  "deactivate",
]);

export const EFFECT_HOOK_NAMES = new Set(["useEffect", "useLayoutEffect"]);
export const FETCH_CALLEE_NAMES = new Set(["fetch"]);
export const FETCH_MEMBER_OBJECTS = new Set(["axios", "ky", "got"]);
