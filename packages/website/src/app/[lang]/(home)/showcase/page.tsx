import { PlusIcon } from "lucide-react";
import { SectionContainer, SectionContent } from "@/components/landing/section-layout";
import { Footer } from "@/components/landing/footer";
import { LINK } from "@/constants/links";
import { SHOWCASE_PROJECTS } from "@/constants/showcase";
import { Button } from "@/components/ui/button";
import { i18n } from "@/lib/i18n";
import { getTranslation } from "@/translations";

export const generateStaticParams = () => i18n.languages.map((lang) => ({ lang }));

const ShowcasePage = async ({ params }: { params: Promise<{ lang: string }> }) => {
  const { lang } = await params;
  const translation = getTranslation(lang);

  return (
    <>
      <SectionContainer className="flex-1 flex flex-col">
        <SectionContent className="w-full flex-1">
          <div className="flex flex-col border-b border-fd-border items-center px-6 py-16 text-center">
            <h1 className="text-3xl font-pixel font-bold text-fd-foreground sm:text-4xl mb-2">
              {translation.showcasePage.heading}
            </h1>
            <p className="text-fd-muted-foreground mb-6">{translation.showcasePage.description}</p>
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

          {SHOWCASE_PROJECTS.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
              {SHOWCASE_PROJECTS.map((project) => (
                <a
                  key={project.name}
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center border-b border-r border-fd-border px-6 py-5 text-sm font-medium text-fd-foreground transition-colors hover:bg-fd-accent/20"
                >
                  {project.name}
                </a>
              ))}
            </div>
          ) : (
            <div className="flex flex-col flex-1 items-center gap-2 px-6 py-24 text-center text-fd-muted-foreground">
              <p className="text-sm">{translation.showcasePage.empty}</p>
            </div>
          )}
        </SectionContent>
      </SectionContainer>
      <Footer translation={translation} />
    </>
  );
};

export default ShowcasePage;
