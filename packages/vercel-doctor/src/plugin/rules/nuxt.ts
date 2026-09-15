import type { EsTreeNode, Rule, RuleContext } from "../types.js";

const NUXT_CONFIG_FILE_PATTERN = /(?:^|\/)nuxt\.config\.[cm]?[jt]s$/;
const NUXT_SERVER_DIR_PATTERN =
  /(?:^|\/)server\/(?:api\/|routes\/|middleware\/)/;
const AWAIT_TOKEN_PATTERN = /\bawait\b/g;

export const nuxtConfigSsrFalse: Rule = {
  create: (context: RuleContext) => ({
    Property(node: EsTreeNode) {
      const filename = context.getFilename?.() ?? "";
      if (!NUXT_CONFIG_FILE_PATTERN.test(filename)) {
        return;
      }

      if (
        node.key?.type === "Identifier" &&
        node.key.name === "ssr" &&
        node.value?.type === "Literal" &&
        node.value.value === false
      ) {
        context.report({
          message:
            "Nuxt config has `ssr: false` — this disables server-side rendering and defeats Vercel edge optimization",
          node,
        });
      }
    },
  }),
};

export const nuxtNoTopLevelAwaitInServerRoute: Rule = {
  create: (context: RuleContext) => ({
    Program(programNode: EsTreeNode) {
      const filename = context.getFilename?.() ?? "";
      if (!NUXT_SERVER_DIR_PATTERN.test(filename)) {
        return;
      }

      const sourceCode = context.sourceCode ?? null;
      if (!sourceCode) {
        return;
      }

      const astBody = programNode.body ?? [];
      for (const node of astBody) {
        if (
          node.type === "ExportDefaultDeclaration" ||
          node.type === "ExportNamedDeclaration"
        ) {
          const handlerBody =
            node.declaration?.body?.body ?? node.init?.body?.body ?? [];
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
                "Nitro server route runs async calls sequentially — use `Promise.all()` to parallelize independent operations",
              node,
            });
          }
        }
      }
    },
  }),
};
