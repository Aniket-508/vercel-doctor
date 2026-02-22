import type { MetadataRoute } from "next";
import { source } from "@/lib/source";
import { SITE } from "@/constants/site";
import { LANGUAGES } from "@/lib/i18n";

const staticPages = [
  { path: "/", priority: 1.0 },
  { path: "/docs", priority: 0.9 },
  { path: "/showcase", priority: 0.6 },
  { path: "/sponsors", priority: 0.6 },
];

const sitemap = (): MetadataRoute.Sitemap => {
  const today = new Date().toISOString().split("T")[0];

  const staticEntries: MetadataRoute.Sitemap = staticPages.flatMap(({ path, priority }) =>
    LANGUAGES.map((lang) => ({
      url: `${SITE.URL}${lang === "en" ? "" : `/${lang}`}${path}`,
      lastModified: today,
      changeFrequency: "weekly" as const,
      priority,
    })),
  );

  const docPages = source.getPages();
  const docEntries: MetadataRoute.Sitemap = docPages.map((page) => ({
    url: `${SITE.URL}${page.url}`,
    lastModified: today,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticEntries, ...docEntries];
};

export default sitemap;
