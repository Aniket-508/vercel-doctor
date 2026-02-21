import { PlusIcon } from "lucide-react";
import { SectionContainer, SectionContent } from "@/components/landing/section-layout";
import { Footer } from "@/components/landing/footer";
import { LINK } from "@/constants/links";
import { SHOWCASE_PROJECTS } from "@/constants/showcase";
import { Button } from "@/components/ui/button";

const ShowcasePage = () => (
  <>
    <SectionContainer className="flex-1 flex flex-col">
      <SectionContent className="w-full flex-1">
        <div className="flex flex-col border-b border-fd-border items-center px-6 py-16 text-center">
          <h1 className="text-3xl font-pixel font-bold text-fd-foreground sm:text-4xl mb-2">
            Showcases
          </h1>
          <p className="text-fd-muted-foreground mb-6">
            A collection of projects using Vercel Doctor.
          </p>
          <Button asChild>
            <a
              href={`${LINK.GITHUB}/issues/new?title=Showcase+submission&body=Project+name:%0AProject+URL:`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <PlusIcon />
              Suggest Yours
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
            <p className="text-sm">No showcases yet. Be the first to submit yours!</p>
          </div>
        )}
      </SectionContent>
    </SectionContainer>
    <Footer />
  </>
);

export default ShowcasePage;
