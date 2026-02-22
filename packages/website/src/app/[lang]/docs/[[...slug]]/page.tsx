import { LINK } from "@/constants/links";
import { LANGUAGES } from "@/lib/i18n";
import { getPageImage, source } from "@/lib/source";
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from "fumadocs-ui/layouts/docs/page";
import { createRelativeLink } from "fumadocs-ui/mdx";
import { getMDXComponents } from "@/mdx-components";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LLMCopyButton, ViewOptions } from "@/components/ai/page-actions";
import { getLocalizedPath } from "@/translations";

interface DocsPageProps {
  params: Promise<{ lang: string; slug?: string[] }>;
}

export default async function Page({ params }: DocsPageProps) {
  const { slug, lang } = await params;
  const page = source.getPage(slug, lang);
  if (!page) notFound();

  const MDX = page.data.body;

  return (
    <DocsPage toc={page.data.toc} full={page.data.full}>
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription className="mb-0">{page.data.description}</DocsDescription>
      <div className="flex flex-row gap-2 items-center border-b pb-6">
        <LLMCopyButton markdownUrl={`${page.url}.mdx`} />
        <ViewOptions markdownUrl={`${page.url}.mdx`} githubUrl={`${LINK.DOCS}/${page.path}`} />
      </div>
      <DocsBody>
        <MDX
          components={getMDXComponents({
            a: createRelativeLink(source, page),
          })}
        />
      </DocsBody>
    </DocsPage>
  );
}

export function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata({ params }: DocsPageProps): Promise<Metadata> {
  const { slug, lang } = await params;
  const page = source.getPage(slug, lang);
  if (!page) notFound();

  const docPath = `/docs/${page.slugs.join("/")}`;
  const canonical = getLocalizedPath(lang, docPath);
  const languages: Record<string, string> = Object.fromEntries(
    LANGUAGES.map((locale) => [locale, getLocalizedPath(locale, docPath)]),
  );
  languages["x-default"] = getLocalizedPath("en", docPath);

  return {
    title: page.data.title,
    description: page.data.description,
    alternates: {
      canonical,
      languages,
    },
    openGraph: {
      images: getPageImage(page).url,
    },
  };
}
