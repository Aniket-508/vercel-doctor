import type { EsTreeNode, Rule, RuleContext } from "../types.js";

const SVELTEKIT_LOAD_FILE_PATTERN =
  /(?:^|\/)\+(?:page|layout)(?:\.server)?\.[cm]?[jt]s$/;
const SVELTEKIT_SERVER_FILE_PATTERN = /(?:^|\/)\+server\.[cm]?[jt]s$/;
const SERVER_ONLY_IMPORT_PATTERN = /^\$lib\/server(?:\/|$)/;
const AWAIT_TOKEN_PATTERN = /\bawait\b/g;

export const sveltekitLoadSequentialAwait: Rule = {
  create: (context: RuleContext) => ({
    Program(programNode: EsTreeNode) {
      const filename = context.getFilename?.() ?? "";
      if (
        !SVELTEKIT_LOAD_FILE_PATTERN.test(filename) &&
        !SVELTEKIT_SERVER_FILE_PATTERN.test(filename)
      ) {
        return;
      }

      const sourceCode = context.sourceCode ?? null;
      if (!sourceCode) {
        return;
      }

      const astBody = programNode.body ?? [];
      for (const node of astBody) {
        if (
          node.type === "ExportNamedDeclaration" &&
          node.declaration?.body?.body
        ) {
          const handlerBody = node.declaration.body.body;
          let awaitCount = 0;

          for (const stmt of handlerBody) {
            const stmtSource = JSON.stringify(stmt);
            const matches = stmtSource.match(AWAIT_TOKEN_PATTERN);
            if (matches) {
              awaitCount += matches.length;
            }
          }

          if (
            awaitCount >= 2 &&
            !JSON.stringify(handlerBody).includes("Promise.all")
          ) {
            context.report({
              message:
                "SvelteKit load function runs async calls sequentially — use `Promise.all()` to parallelize independent operations",
              node,
            });
          }
        }
      }
    },
  }),
};

export const sveltekitServerImportInClientLoad: Rule = {
  create: (context: RuleContext) => ({
    ImportDeclaration(node: EsTreeNode) {
      const filename = context.getFilename?.() ?? "";
      if (!SVELTEKIT_LOAD_FILE_PATTERN.test(filename)) {
        return;
      }

      if (
        filename.includes(".server.") ||
        node.importKind === "type" ||
        (node.specifiers?.length > 0 &&
          node.specifiers.every(
            (specifier: EsTreeNode) => specifier.importKind === "type",
          ))
      ) {
        return;
      }

      const source = node.source?.value;
      if (
        typeof source === "string" &&
        SERVER_ONLY_IMPORT_PATTERN.test(source)
      ) {
        context.report({
          message:
            "Universal load function imports from `$lib/server` — move server-only work to `+page.server.ts` or `+layout.server.ts`; SvelteKit rejects server-only imports in browser code",
          node,
        });
      }
    },
  }),
};
