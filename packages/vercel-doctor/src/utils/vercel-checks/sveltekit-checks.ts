import ts from "typescript";

import { VERCEL_RULE_IDS } from "../../rule-ids.js";
import type { Diagnostic, FrameworkCheckProvider } from "../../types.js";
import {
  createVercelWarningDiagnostic,
  getLineNumberForCharacterIndex,
  getLineNumberForPattern,
  readTextFileSafely,
  shouldInspectPath,
} from "./generic-checks.js";

const SVELTEKIT_CONFIG_FILE_PATTERN = /^svelte\.config\.[cm]?[jt]s$/;

const SVELTEKIT_LOAD_FILE_PATTERN =
  /(?:^|\/)\+(?:page|layout)(?:\.server)?\.[cm]?[jt]s$/;
const SVELTEKIT_SERVER_FILE_PATTERN = /(?:^|\/)\+server\.[cm]?[jt]s$/;

const SERVER_AWAIT_PATTERN = /\bawait\b/g;
const SERVER_PROMISE_ALL_PATTERN = /Promise\.all\s*\(/;
const SERVER_AWAIT_LINE_PATTERN = /\bawait\b/;

const SVELTEKIT_ADAPTER_VERCEL_PATTERN = /adapter-vercel/;
const SVELTEKIT_CONFIG_SPLIT_PATTERN = /split\s*:\s*true/;

const SERVER_ONLY_IMPORT_PATTERN = /^\$lib\/server(?:\/|$)/;

const collectSvelteKitLoadDiagnostics = (
  relativeFilePath: string,
  fileContent: string,
  diagnostics: Diagnostic[],
): void => {
  if (!SVELTEKIT_LOAD_FILE_PATTERN.test(relativeFilePath)) {
    return;
  }

  if (SERVER_PROMISE_ALL_PATTERN.test(fileContent)) {
    return;
  }

  const awaitCount = (fileContent.match(SERVER_AWAIT_PATTERN) ?? []).length;
  if (awaitCount >= 2) {
    diagnostics.push(
      createVercelWarningDiagnostic(
        relativeFilePath,
        VERCEL_RULE_IDS.SEQUENTIAL_DATABASE_AWAIT,
        "SvelteKit load function appears to run async calls sequentially — parallelizing reduces load time",
        "Use `Promise.all()` for independent async operations in load functions.",
        getLineNumberForPattern(fileContent, SERVER_AWAIT_LINE_PATTERN),
      ),
    );
  }
};

const collectSvelteKitServerRouteDiagnostics = (
  relativeFilePath: string,
  fileContent: string,
  diagnostics: Diagnostic[],
): void => {
  if (!SVELTEKIT_SERVER_FILE_PATTERN.test(relativeFilePath)) {
    return;
  }

  if (SERVER_PROMISE_ALL_PATTERN.test(fileContent)) {
    return;
  }

  const awaitCount = (fileContent.match(SERVER_AWAIT_PATTERN) ?? []).length;
  if (awaitCount >= 2) {
    diagnostics.push(
      createVercelWarningDiagnostic(
        relativeFilePath,
        VERCEL_RULE_IDS.SEQUENTIAL_DATABASE_AWAIT,
        "SvelteKit server route appears to run async calls sequentially — parallelizing reduces function duration",
        "Use `Promise.all()` for independent async operations in +server.ts handlers.",
        getLineNumberForPattern(fileContent, SERVER_AWAIT_LINE_PATTERN),
      ),
    );
  }
};

const collectSvelteKitServerImportInClientLoad = (
  relativeFilePath: string,
  fileContent: string,
  diagnostics: Diagnostic[],
): void => {
  if (!SVELTEKIT_LOAD_FILE_PATTERN.test(relativeFilePath)) {
    return;
  }

  if (relativeFilePath.includes(".server.")) {
    return;
  }

  if (!fileContent.includes("$lib/server")) {
    return;
  }

  const sourceFile = ts.createSourceFile(
    relativeFilePath,
    fileContent,
    ts.ScriptTarget.Latest,
  );
  for (const statement of sourceFile.statements) {
    if (
      !ts.isImportDeclaration(statement) ||
      !ts.isStringLiteral(statement.moduleSpecifier) ||
      !SERVER_ONLY_IMPORT_PATTERN.test(statement.moduleSpecifier.text)
    ) {
      continue;
    }

    const { importClause } = statement;
    const namedBindings = importClause?.namedBindings;
    if (
      importClause?.isTypeOnly ||
      (!importClause?.name &&
        namedBindings &&
        ts.isNamedImports(namedBindings) &&
        namedBindings.elements.length > 0 &&
        namedBindings.elements.every((specifier) => specifier.isTypeOnly))
    ) {
      continue;
    }

    diagnostics.push(
      createVercelWarningDiagnostic(
        relativeFilePath,
        VERCEL_RULE_IDS.MISSING_CACHE_POLICY,
        "Universal load function imports from `$lib/server` — SvelteKit rejects server-only imports in browser code",
        "Move server-only work to `+page.server.ts` or `+layout.server.ts`, or use `import type` for type-only dependencies.",
        getLineNumberForCharacterIndex(
          fileContent,
          statement.getStart(sourceFile),
        ),
      ),
    );
  }
};

const collectSvelteKitConfigDiagnostics = (
  rootDirectory: string,
  projectFilePaths: string[],
  includedPathSet: Set<string> | null,
  diagnostics: Diagnostic[],
): void => {
  const configFile = projectFilePaths.find((filePath) =>
    SVELTEKIT_CONFIG_FILE_PATTERN.test(filePath),
  );
  if (!configFile || !shouldInspectPath(configFile, includedPathSet)) {
    return;
  }

  const fileContent = readTextFileSafely(`${rootDirectory}/${configFile}`);
  if (!fileContent) {
    return;
  }

  if (
    SVELTEKIT_ADAPTER_VERCEL_PATTERN.test(fileContent) &&
    !SVELTEKIT_CONFIG_SPLIT_PATTERN.test(fileContent)
  ) {
    diagnostics.push(
      createVercelWarningDiagnostic(
        configFile,
        VERCEL_RULE_IDS.CONSIDER_FLUID_COMPUTE,
        "SvelteKit adapter-vercel is configured without `split: true` — enabling split produces smaller, faster functions",
        "Add `split: true` to adapter-vercel options in svelte.config.js for better function isolation.",
        getLineNumberForPattern(fileContent, SVELTEKIT_ADAPTER_VERCEL_PATTERN),
      ),
    );
  }

  const hasPrerenderConfig = projectFilePaths.some((filePath) => {
    if (
      !SVELTEKIT_LOAD_FILE_PATTERN.test(filePath) &&
      !SVELTEKIT_SERVER_FILE_PATTERN.test(filePath)
    ) {
      return false;
    }
    const routeContent = readTextFileSafely(`${rootDirectory}/${filePath}`);
    return (
      routeContent !== null &&
      /\bexport\s+const\s+prerender\s*=/.test(routeContent)
    );
  });
  if (!hasPrerenderConfig) {
    const hasStaticContent = fileContent.includes("prerender");
    if (!hasStaticContent) {
      diagnostics.push(
        createVercelWarningDiagnostic(
          configFile,
          VERCEL_RULE_IDS.MISSING_CACHE_POLICY,
          "No prerender configuration detected — consider prerendering static routes to reduce function invocations",
          "Add `export const prerender = true` to static pages or layouts, and configure `kit.prerender.entries` in svelte.config.js when needed.",
        ),
      );
    }
  }
};

export const sveltekitCheckProvider: FrameworkCheckProvider = {
  collectConfigDiagnostics: collectSvelteKitConfigDiagnostics,
  collectFileDiagnostics: (
    relativeFilePath,
    fileContent,
    _projectContext,
    diagnostics,
  ) => {
    collectSvelteKitLoadDiagnostics(relativeFilePath, fileContent, diagnostics);
    collectSvelteKitServerRouteDiagnostics(
      relativeFilePath,
      fileContent,
      diagnostics,
    );
    collectSvelteKitServerImportInClientLoad(
      relativeFilePath,
      fileContent,
      diagnostics,
    );
  },
  framework: "sveltekit",
};
