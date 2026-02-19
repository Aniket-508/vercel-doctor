import {
  EFFECT_HOOK_NAMES,
  MUTATING_ROUTE_SEGMENTS,
  OG_ROUTE_PATTERN,
  PAGE_OR_LAYOUT_FILE_PATTERN,
  PAGES_DIRECTORY_PATTERN,
  ROUTE_HANDLER_FILE_PATTERN,
} from "../constants.js";
import {
  containsFetchCall,
  findSideEffect,
  getEffectCallback,
  hasDirective,
  hasJsxAttribute,
  isHookCall,
} from "../helpers.js";
import type { EsTreeNode, Rule, RuleContext } from "../types.js";

export const nextjsNoImgElement: Rule = {
  create: (context: RuleContext) => {
    const filename = context.getFilename?.() ?? "";
    const isOgRoute = OG_ROUTE_PATTERN.test(filename);

    return {
      JSXOpeningElement(node: EsTreeNode) {
        if (isOgRoute) return;
        if (node.name?.type === "JSXIdentifier" && node.name.name === "img") {
          context.report({
            node,
            message:
              "Use next/image instead of <img> — provides automatic optimization, lazy loading, and responsive srcset",
          });
        }
      },
    };
  },
};

export const nextjsNoClientFetchForServerData: Rule = {
  create: (context: RuleContext) => {
    let fileHasUseClient = false;

    return {
      Program(programNode: EsTreeNode) {
        fileHasUseClient = hasDirective(programNode, "use client");
      },
      CallExpression(node: EsTreeNode) {
        if (!fileHasUseClient || !isHookCall(node, EFFECT_HOOK_NAMES)) return;

        const callback = getEffectCallback(node);
        if (!callback || !containsFetchCall(callback)) return;

        const filename = context.getFilename?.() ?? "";
        const isPageOrLayoutFile =
          PAGE_OR_LAYOUT_FILE_PATTERN.test(filename) || PAGES_DIRECTORY_PATTERN.test(filename);

        if (isPageOrLayoutFile) {
          context.report({
            node,
            message:
              "useEffect + fetch in a page/layout — fetch data server-side with a server component instead",
          });
        }
      },
    };
  },
};

export const nextjsImageMissingSizes: Rule = {
  create: (context: RuleContext) => ({
    JSXOpeningElement(node: EsTreeNode) {
      if (node.name?.type !== "JSXIdentifier" || node.name.name !== "Image") return;
      const attributes = node.attributes ?? [];
      if (!hasJsxAttribute(attributes, "fill")) return;
      if (hasJsxAttribute(attributes, "sizes")) return;

      context.report({
        node,
        message:
          "next/image with fill but no sizes — the browser downloads the largest image. Add a sizes attribute for responsive behavior",
      });
    },
  }),
};

const extractMutatingRouteSegment = (filename: string): string | null => {
  const segments = filename.split("/");
  for (const segment of segments) {
    const cleaned = segment.replace(/^\[.*\]$/, "");
    if (MUTATING_ROUTE_SEGMENTS.has(cleaned)) return cleaned;
  }
  return null;
};

const getExportedGetHandlerBody = (node: EsTreeNode): EsTreeNode | null => {
  if (node.type !== "ExportNamedDeclaration") return null;
  const declaration = node.declaration;
  if (!declaration) return null;

  if (declaration.type === "FunctionDeclaration" && declaration.id?.name === "GET") {
    return declaration.body;
  }

  if (declaration.type === "VariableDeclaration") {
    const declarator = declaration.declarations?.[0];
    if (
      declarator?.id?.type === "Identifier" &&
      declarator.id.name === "GET" &&
      declarator.init &&
      (declarator.init.type === "ArrowFunctionExpression" ||
        declarator.init.type === "FunctionExpression")
    ) {
      return declarator.init.body;
    }
  }

  return null;
};

export const nextjsNoSideEffectInGetHandler: Rule = {
  create: (context: RuleContext) => ({
    ExportNamedDeclaration(node: EsTreeNode) {
      const filename = context.getFilename?.() ?? "";
      if (!ROUTE_HANDLER_FILE_PATTERN.test(filename)) return;

      const handlerBody = getExportedGetHandlerBody(node);
      if (!handlerBody) return;

      const mutatingSegment = extractMutatingRouteSegment(filename);
      if (mutatingSegment) {
        context.report({
          node,
          message: `GET handler on "/${mutatingSegment}" route — use POST to prevent CSRF and unintended prefetch triggers`,
        });
        return;
      }

      const sideEffect = findSideEffect(handlerBody);
      if (sideEffect) {
        context.report({
          node,
          message: `GET handler has side effects (${sideEffect}) — use POST to prevent CSRF and unintended prefetch triggers`,
        });
      }
    },
  }),
};
