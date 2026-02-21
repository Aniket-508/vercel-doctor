import { Plus } from "lucide-react";
import { GridSection } from "@/components/landing/grid-section";
import { Footer } from "@/components/landing/footer";
import { LINK, SHOWCASE_PROJECTS } from "@/components/landing/constants";

const ShowcasePage = () => (
  <>
    <GridSection>
      <div className="border-b border-fd-border">
        <div className="flex flex-col items-center gap-4 px-6 py-16 text-center">
          <h1 className="text-3xl font-bold text-fd-foreground sm:text-4xl">Showcases</h1>
          <p className="max-w-lg text-fd-muted-foreground">
            A collection of projects using Vercel Doctor.
          </p>
          <a
            href={`${LINK.GITHUB}/issues/new?title=Showcase+submission&body=Project+name:%0AProject+URL:`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-fd-border px-5 py-2 text-sm font-medium text-fd-foreground transition-colors hover:bg-fd-muted"
          >
            <Plus className="size-4" />
            Suggest Yours
          </a>
        </div>
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
        <div className="flex flex-col items-center gap-2 px-6 py-24 text-center text-fd-muted-foreground">
          <p className="text-sm">No showcases yet. Be the first to submit yours!</p>
        </div>
      )}
    </GridSection>
    <Footer />
  </>
);

export default ShowcasePage;
