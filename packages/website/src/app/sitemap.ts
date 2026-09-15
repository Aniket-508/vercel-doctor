import type { MetadataRoute } from "next";

import { ROUTES } from "@/constants/routes";
import { SITE } from "@/constants/site";
import { i18n } from "@/i18n/config";
import { withLocalePrefix } from "@/i18n/navigation";
import { source } from "@/lib/source";

const STATIC_PATHS: { path: `/${string}`; priority: number }[] = [
  { path: ROUTES.HOME, priority: 1 },
  { path: ROUTES.DOCS, priority: 0.9 },
  { path: ROUTES.HORRORS, priority: 0.7 },
  { path: ROUTES.SHARE, priority: 0.7 },
  { path: ROUTES.SHOWCASE, priority: 0.6 },
  { path: ROUTES.SPONSORS, priority: 0.6 },
];

const buildAlternates = (
  path: `/${string}`,
): { languages: Record<string, string> } => {
  const languages: Record<string, string> = {};
  for (const lang of i18n.languages) {
    languages[lang] = `${SITE.URL}${withLocalePrefix(lang, path)}`;
  }
  languages["x-default"] =
    `${SITE.URL}${withLocalePrefix(i18n.defaultLanguage, path)}`;
  return { languages };
};

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const entries: MetadataRoute.Sitemap = [];

  for (const { path, priority } of STATIC_PATHS) {
    entries.push({
      alternates: buildAlternates(path),
      changeFrequency: "weekly" as const,
      lastModified,
      priority,
      url: `${SITE.URL}${withLocalePrefix(i18n.defaultLanguage, path)}`,
    });
  }

  const docSlugs = [
    ...new Map(
      source
        .getPages()
        .filter(
          (page) =>
            page.locale === i18n.defaultLanguage && page.slugs.length > 0,
        )
        .map((page) => [page.slugs.join("/"), page.slugs]),
    ).values(),
  ];

  for (const slugs of docSlugs) {
    const path = `${ROUTES.DOCS}/${slugs.join("/")}` as `/${string}`;
    entries.push({
      alternates: buildAlternates(path),
      changeFrequency: "weekly" as const,
      lastModified,
      priority: 0.8,
      url: `${SITE.URL}${withLocalePrefix(i18n.defaultLanguage, path)}`,
    });
  }

  return entries;
}
