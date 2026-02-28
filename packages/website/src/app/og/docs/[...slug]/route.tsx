import DocsOgImage from "@/components/og/docs-og-image";
import { i18n } from "@/lib/i18n";
import { getPageImage, source } from "@/lib/source";
import { loadFontsForLocale } from "@/utils/load-og-fonts";
import { ImageResponse } from "@takumi-rs/image-response";
import { notFound } from "next/navigation";

export const revalidate = false;

export async function GET(_req: Request, { params }: RouteContext<"/og/docs/[...slug]">) {
  const { slug } = await params;
  const slugWithoutExt = slug.slice(0, -1);
  const firstSegment = slugWithoutExt[0];
  const parsedLocale = i18n.languages.find((lang) => lang === firstSegment);
  const locale = parsedLocale ?? i18n.defaultLanguage;
  const docSlug = parsedLocale ? slugWithoutExt.slice(1) : slugWithoutExt;
  const page = source.getPage(docSlug, locale);
  if (!page) notFound();

  const localeFonts = await loadFontsForLocale(locale);

  return new ImageResponse(
    <DocsOgImage title={page.data.title} description={page.data.description} />,
    {
      width: 1200,
      height: 630,
      format: "webp",
      ...(localeFonts.length > 0 && {
        fonts: localeFonts,
        loadDefaultFonts: true,
      }),
    },
  );
}

export function generateStaticParams() {
  return source.getPages().map((page) => ({
    slug: getPageImage(page).segments,
  }));
}
