import { SITE } from "@/constants/site";
import { i18n } from "@/lib/i18n";
import { source } from "@/lib/source";

export const revalidate = false;

const STATIC_PAGES: { path: string; priority: number }[] = [
  { path: "/", priority: 1.0 },
  { path: "/docs", priority: 0.9 },
  { path: "/share", priority: 0.7 },
  { path: "/showcase", priority: 0.6 },
  { path: "/sponsors", priority: 0.6 },
];

const buildUrl = (lang: string, path: string): string => {
  const pathWithLang = lang === i18n.defaultLanguage ? path : `/${lang}${path}`;
  return `${SITE.URL}${pathWithLang}`;
};

const buildAlternateLinks = (path: string): string => {
  const links = i18n.languages.map(
    (lang) =>
      `    <xhtml:link rel="alternate" hreflang="${lang}" href="${buildUrl(lang, path)}" />`,
  );
  links.push(
    `    <xhtml:link rel="alternate" hreflang="x-default" href="${buildUrl(
      i18n.defaultLanguage,
      path,
    )}" />`,
  );
  return links.join("\n");
};

const buildUrlEntry = (path: string, lastmod: string, priority: number): string =>
  `  <url>
    <loc>${buildUrl(i18n.defaultLanguage, path)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
${buildAlternateLinks(path)}
  </url>`;

export const GET = () => {
  const lastmod = new Date().toISOString().split("T")[0];
  const docSlugs = [
    ...new Map(
      source
        .getPages()
        .filter((page) => page.locale === i18n.defaultLanguage && page.slugs.length > 0)
        .map((page) => [page.slugs.join("/"), page.slugs]),
    ).values(),
  ];

  const staticEntries = STATIC_PAGES.map(({ path, priority }) =>
    buildUrlEntry(path, lastmod, priority),
  );
  const docEntries = docSlugs.map((slugs) => {
    const docPath = `/docs/${slugs.join("/")}`;
    return buildUrlEntry(docPath, lastmod, 0.8);
  });

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${[...staticEntries, ...docEntries].join("\n")}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
};
