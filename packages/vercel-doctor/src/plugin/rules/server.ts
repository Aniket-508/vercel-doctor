import { hasDirective } from "../helpers.js";
import type { EsTreeNode, Rule, RuleContext } from "../types.js";

export const serverAfterNonblocking: Rule = {
  create: (context: RuleContext) => {
    let fileHasUseServerDirective = false;

    return {
      Program(programNode: EsTreeNode) {
        fileHasUseServerDirective = hasDirective(programNode, "use server");
      },
      CallExpression(node: EsTreeNode) {
        if (!fileHasUseServerDirective) return;
        if (node.callee?.type !== "MemberExpression") return;
        if (node.callee.property?.type !== "Identifier") return;

        const objectName =
          node.callee.object?.type === "Identifier" ? node.callee.object.name : null;
        if (!objectName) return;

        const methodName = node.callee.property.name;
        const isLoggingCall =
          (objectName === "console" &&
            (methodName === "log" || methodName === "info" || methodName === "warn")) ||
          (objectName === "analytics" &&
            (methodName === "track" || methodName === "identify" || methodName === "page"));
        if (!isLoggingCall) return;

        context.report({
          node,
          message: `${objectName}.${methodName}() in server action — use after() for non-blocking logging/analytics`,
        });
      },
    };
  },
};
