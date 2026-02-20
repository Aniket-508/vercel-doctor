import {
  EFFECT_HOOK_NAMES,
  MUTATING_ROUTE_SEGMENTS,
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
  hasPrefetchDisabled,
  isHookCall,
} from "../helpers.js";
import type { EsTreeNode, Rule, RuleContext } from "../types.js";

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

export const nextjsLinkPrefetchDefault: Rule = {
  create: (context: RuleContext) => {
    const nextLinkLocalNames = new Set<string>();

    return {
      ImportDeclaration(node: EsTreeNode) {
        const source = node.source?.value;
        if (source !== "next/link") return;
        for (const specifier of node.specifiers ?? []) {
          if (specifier.type === "ImportDefaultSpecifier" && specifier.local?.name) {
            nextLinkLocalNames.add(specifier.local.name);
          }
          if (
            specifier.type === "ImportSpecifier" &&
            specifier.imported?.type === "Identifier" &&
            specifier.local?.name
          ) {
            nextLinkLocalNames.add(specifier.local.name);
          }
        }
      },
      JSXOpeningElement(node: EsTreeNode) {
        const elementName = node.name?.type === "JSXIdentifier" ? node.name.name : null;
        if (!elementName || !nextLinkLocalNames.has(elementName)) return;
        const attributes = node.attributes ?? [];
        if (hasPrefetchDisabled(attributes)) return;

        context.report({
          node,
          message:
            "Link prefetches by default — adds compute. Use prefetch={false} or disable globally, then add prefetch={true} only to critical links",
        });
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
