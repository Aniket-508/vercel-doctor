import { SITE } from "@/constants/site";
import { LANGUAGES, type Language } from "@/lib/i18n";
import { source } from "@/lib/source";

const DEFAULT_LANGUAGE = "en";

const STATIC_PAGES = [
  { path: "/", priority: 1.0 },
  { path: "/docs", priority: 0.9 },
  { path: "/showcase", priority: 0.6 },
  { path: "/sponsors", priority: 0.6 },
];

const LANG_FROM_URL_PATTERN = /\/sitemap-([a-z-]+)\.xml/;

export const generateStaticParams = () => LANGUAGES.map((lang) => ({ lang }));

const buildUrl = (lang: string, path: string): string => {
  const prefix = lang === DEFAULT_LANGUAGE ? "" : `/${lang}`;
  return `${SITE.URL}${prefix}${path}`;
};

const buildAlternates = (lang: string, path: string): string =>
  LANGUAGES.map(
    (alternateLang) =>
      `      <xhtml:link rel="alternate" hreflang="${alternateLang}" href="${buildUrl(alternateLang, path)}" />`,
  ).join("\n");

export const GET = (request: Request) => {
  const url = new URL(request.url);
  const match = LANG_FROM_URL_PATTERN.exec(url.pathname);
  const lang = match?.[1] ?? "";

  if (!LANGUAGES.includes(lang as Language)) {
    return new Response("Not Found", { status: 404 });
  }

  const lastmod = new Date().toISOString().split("T")[0];
  const docSlugs = [
    ...new Map(
      source
        .getPages()
        .filter((page) => page.locale === lang)
        .map((page) => [page.slugs.join("/"), page.slugs]),
    ).values(),
  ];

  const staticEntries = STATIC_PAGES.map(
    ({ path, priority }) => `  <url>
    <loc>${buildUrl(lang, path)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
${buildAlternates(lang, path)}
  </url>`,
  );

  const docEntries = docSlugs.map((slugs) => {
    const docPath = `/docs/${slugs.join("/")}`;
    return `  <url>
    <loc>${buildUrl(lang, docPath)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
${buildAlternates(lang, docPath)}
  </url>`;
  });

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${[...staticEntries, ...docEntries].join("\n")}
</urlset>`;

  return new Response(sitemap, {
    headers: { "Content-Type": "application/xml" },
  });
};
