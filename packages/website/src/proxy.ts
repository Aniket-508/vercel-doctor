import { createI18nMiddleware } from "fumadocs-core/i18n/middleware";
import { isMarkdownPreferred, rewritePath } from "fumadocs-core/negotiation";
import type { NextFetchEvent, NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { i18n, isLocale } from "@/i18n/config";

const i18nMiddleware = createI18nMiddleware(i18n);

const { rewrite: rewriteDocsMdx } = rewritePath(
  "/docs{/*path}.mdx",
  "/llms.mdx/docs{/*path}",
);
const { rewrite: rewriteDocsMarkdown } = rewritePath(
  "/docs{/*path}",
  "/llms.mdx/docs{/*path}",
);

const withOptionalLocale = (
  pathname: string,
  section: "docs",
  rewrite: (pathname: string) => string | false,
): string | null => {
  const direct = rewrite(pathname);
  if (direct) {
    return direct;
  }

  const localized = pathname.match(new RegExp(`^/([^/]+)/${section}(.*)$`));
  if (!localized?.[1] || !isLocale(localized[1])) {
    return null;
  }

  const [, lang, rest = ""] = localized;
  const rewritten = rewrite(`/${section}${rest}`);
  if (!rewritten) {
    return null;
  }

  return rewritten.replace(
    `/llms.mdx/${section}`,
    `/llms.mdx/${section}/${lang}`,
  );
};

const rewriteMdxPath = (pathname: string) =>
  withOptionalLocale(pathname, "docs", rewriteDocsMdx);

const rewriteLLMPath = (pathname: string) =>
  withOptionalLocale(pathname, "docs", rewriteDocsMarkdown);

export const proxy = (request: NextRequest, event: NextFetchEvent) => {
  const { pathname } = request.nextUrl;

  if (pathname === "/" && isMarkdownPreferred(request)) {
    return NextResponse.rewrite(new URL("/llms.txt", request.nextUrl));
  }

  const rewriteMdxResult = rewriteMdxPath(pathname);

  if (rewriteMdxResult) {
    return NextResponse.rewrite(new URL(rewriteMdxResult, request.nextUrl));
  }

  if (isMarkdownPreferred(request)) {
    const rewriteLLMResult = rewriteLLMPath(pathname);
    if (rewriteLLMResult) {
      return NextResponse.rewrite(new URL(rewriteLLMResult, request.nextUrl));
    }
  }

  return i18nMiddleware(request, event);
};

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon\\.ico|favicon\\.svg|icon-light\\.svg|og\\.png|vercel-doctor-logo-dark\\.svg|vercel-doctor-logo-light\\.svg|robots\\.txt|sitemap\\.xml|og|share|llms\\.txt|llms-full\\.txt|llms\\.mdx|install-skill).*)",
  ],
};
