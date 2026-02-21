import { Heart } from "lucide-react";
import Image from "next/image";
import { GridSection } from "@/components/landing/grid-section";
import { Footer } from "@/components/landing/footer";
import { LINK, SPONSORS } from "@/components/landing/constants";
import type { Sponsor } from "@/components/landing/constants";

const SponsorCard = ({ sponsor }: { sponsor: Sponsor }) => (
  <a
    href={sponsor.url}
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center gap-3 border-b border-r border-fd-border px-6 py-5 transition-colors hover:bg-fd-accent/20"
  >
    <Image
      src={sponsor.logoUrl}
      alt={sponsor.name}
      width={96}
      height={24}
      className="h-6 w-auto object-contain"
    />
    <span className="text-sm font-medium text-fd-foreground">{sponsor.name}</span>
  </a>
);

const EmptyCell = () => (
  <a
    href={LINK.SPONSOR}
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center justify-center border-b border-r border-fd-border px-6 py-5 text-fd-muted-foreground/40 transition-colors hover:bg-fd-accent/10 hover:text-fd-muted-foreground"
  >
    <span className="text-2xl font-light">+</span>
  </a>
);

const SponsorsPage = () => {
  const activeSponors = SPONSORS.filter(Boolean) as Sponsor[];

  return (
    <>
      <GridSection>
        <div className="border-b border-fd-border">
          <div className="flex flex-col items-center gap-4 px-6 py-16 text-center">
            <h1 className="text-3xl font-bold text-fd-foreground sm:text-4xl">Sponsors</h1>
            <p className="max-w-lg text-fd-muted-foreground">
              Your sponsorship means a lot to open-source projects, including Vercel Doctor.
            </p>
            <a
              href={LINK.SPONSOR}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-fd-border px-5 py-2 text-sm font-medium text-fd-foreground transition-colors hover:bg-fd-muted"
            >
              <Heart className="size-4" />
              Sponsor My Work
            </a>
          </div>
        </div>

        {activeSponors.length > 0 && (
          <>
            <div className="border-b border-fd-border px-6 py-3">
              <p className="text-xs font-medium uppercase tracking-widest text-fd-muted-foreground">
                Organization Sponsors
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
              {activeSponors.map((sponsor) => (
                <SponsorCard key={sponsor.name} sponsor={sponsor} />
              ))}
              <EmptyCell />
            </div>
          </>
        )}

        {activeSponors.length === 0 && (
          <div className="flex flex-col items-center gap-2 px-6 py-24 text-center text-fd-muted-foreground">
            <p className="text-sm">No sponsors yet. Be the first to support this project!</p>
          </div>
        )}
      </GridSection>
      <Footer />
    </>
  );
};

export default SponsorsPage;
