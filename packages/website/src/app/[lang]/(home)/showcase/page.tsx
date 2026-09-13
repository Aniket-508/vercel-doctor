import { PlusIcon } from "lucide-react";
import type { Metadata } from "next";

import { GithubIcon } from "@/components/icons";
import { Footer } from "@/components/landing/footer";
import {
  SectionContainer,
  SectionContent,
} from "@/components/landing/section-layout";
import { Button } from "@/components/ui/button";
import { LINK } from "@/constants/links";
import { ROUTES } from "@/constants/routes";
import {
  SHOWCASE_LARGE_GRID_COLUMN_COUNT,
  SHOWCASE_LOGO_SIZE_PX,
  SHOWCASE_MEDIUM_GRID_COLUMN_COUNT,
} from "@/constants/showcase";
import { i18n } from "@/i18n/config";
import { withLocalePrefix } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { createMetadata } from "@/seo/metadata";
import { getTranslation } from "@/translations";
import { getShowcaseProjects } from "@/utils/get-showcase-projects";

export const generateStaticParams = () =>
  i18n.languages.map((lang) => ({ lang }));

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> => {
  const { lang } = await params;
  const translation = getTranslation(lang);

  return createMetadata({
    canonical: withLocalePrefix(lang, ROUTES.SHOWCASE),
    description: translation.showcasePage.description,
    title: translation.showcasePage.heading,
  });
};

const ShowcasePage = async ({
  params,
}: {
  params: Promise<{ lang: string }>;
}) => {
  const { lang } = await params;
  const translation = getTranslation(lang);
  const showcaseProjects = await getShowcaseProjects();
  const shouldRenderMediumGridFiller = Boolean(
    showcaseProjects.length % SHOWCASE_MEDIUM_GRID_COLUMN_COUNT,
  );
  const largeGridFillerCount =
    (SHOWCASE_LARGE_GRID_COLUMN_COUNT -
      (showcaseProjects.length % SHOWCASE_LARGE_GRID_COLUMN_COUNT)) %
    SHOWCASE_LARGE_GRID_COLUMN_COUNT;

  return (
    <>
      <SectionContainer className="flex flex-1 flex-col">
        <SectionContent className="w-full flex-1">
          <div className="border-fd-border flex flex-col items-center border-b px-6 py-16 text-center">
            <h1 className="font-pixel text-fd-foreground mb-2 text-3xl font-bold sm:text-4xl">
              {translation.showcasePage.heading}
            </h1>
            <p className="text-fd-muted-foreground mb-6">
              {translation.showcasePage.description}
            </p>
            <Button asChild>
              <a
                href={`${LINK.GITHUB}/issues/new?title=Showcase+submission&body=Project+name:%0AProject+URL:`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <PlusIcon />
                {translation.showcasePage.suggestYours}
              </a>
            </Button>
          </div>

          <div className="*:border-grid-border grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 lg:[&>article:not(:nth-child(3n))]:border-r sm:max-lg:[&>article:nth-child(2n+1)]:border-r max-sm:[&>article:nth-child(n+2)]:border-t sm:max-lg:[&>article:nth-child(n+3)]:border-t lg:[&>article:nth-child(n+4)]:border-t">
            {showcaseProjects.map((project) => (
              <article
                key={project.name}
                className="group hover:bg-fd-accent/20 relative flex flex-col transition-colors"
              >
                <a
                  href={project.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Visit ${project.name} website`}
                  className="focus-visible:ring-fd-ring absolute inset-0 z-0 focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset"
                />
                <div className="pointer-events-none relative flex flex-1 flex-col p-5">
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={project.logoUrl}
                      alt={`${project.name} logo`}
                      width={SHOWCASE_LOGO_SIZE_PX}
                      height={SHOWCASE_LOGO_SIZE_PX}
                      loading="lazy"
                      decoding="async"
                      className="size-6 shrink-0 object-contain"
                    />
                    <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
                      <h2 className="text-fd-foreground truncate text-sm font-semibold">
                        {project.name}
                      </h2>
                      {project.githubRepository ? (
                        <a
                          href={`https://github.com/${project.githubRepository}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={
                            project.stars === null
                              ? `${project.name} on GitHub`
                              : `${
                                  project.name
                                } on GitHub, ${project.stars.toLocaleString()} stars`
                          }
                          className="border-fd-border bg-fd-secondary text-fd-secondary-foreground hover:bg-fd-accent pointer-events-auto relative z-10 inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2 py-1 text-xs font-medium transition-colors"
                        >
                          <GithubIcon className="size-3.5" />
                          {project.stars === null
                            ? "—"
                            : project.stars.toLocaleString()}
                        </a>
                      ) : null}
                    </div>
                  </div>
                  <p className="text-fd-muted-foreground mt-2 text-sm leading-relaxed">
                    {project.description}
                  </p>
                </div>
              </article>
            ))}
            {shouldRenderMediumGridFiller && (
              <div
                aria-hidden="true"
                className="hidden border-t sm:block lg:hidden"
              />
            )}
            {Array.from(
              { length: largeGridFillerCount },
              (_unusedValue, fillerIndex) => (
                <div
                  key={`large-grid-filler-${fillerIndex}`}
                  aria-hidden="true"
                  className={cn(
                    "hidden border-t lg:block",
                    fillerIndex < largeGridFillerCount - 1 && "border-r",
                  )}
                />
              ),
            )}
          </div>
        </SectionContent>
      </SectionContainer>
      <Footer translation={translation} />
    </>
  );
};

export default ShowcasePage;
