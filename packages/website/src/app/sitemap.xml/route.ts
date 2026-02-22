import { SITE } from "@/constants/site";
import { LANGUAGES } from "@/lib/i18n";

export const GET = () => {
  const lastmod = new Date().toISOString();

  const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${LANGUAGES.map(
  (lang) => `  <sitemap>
    <loc>${SITE.URL}/sitemap-${lang}.xml</loc>
    <lastmod>${lastmod}</lastmod>
  </sitemap>`,
).join("\n")}
</sitemapindex>`;

  return new Response(sitemapIndex, {
    headers: { "Content-Type": "application/xml" },
  });
};
