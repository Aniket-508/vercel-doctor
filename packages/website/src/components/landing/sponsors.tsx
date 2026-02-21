import Image from "next/image";
import { Plus } from "lucide-react";
import { GridSection } from "./grid-section";
import { LINK, SPONSORS } from "./constants";
import type { Sponsor } from "./constants";

const GRID_SIZE = 16;

const SponsorDot = ({ className }: { className?: string }) => (
  <div className={`absolute size-1.5 rounded-full bg-fd-muted-foreground/30 ${className ?? ""}`} />
);

const SponsorCell = ({ sponsor, isLastCell }: { sponsor: Sponsor | null; isLastCell: boolean }) => {
  if (isLastCell || !sponsor) {
    return (
      <a
        href={LINK.SPONSOR}
        target="_blank"
        rel="noopener noreferrer"
        className="relative flex aspect-[2.5/1] items-center justify-center border-b border-r border-fd-border transition-colors hover:bg-fd-accent/20"
      >
        <SponsorDot className="-top-[3px] -left-[3px]" />
        <SponsorDot className="-top-[3px] -right-[3px]" />
        <SponsorDot className="-bottom-[3px] -left-[3px]" />
        <SponsorDot className="-bottom-[3px] -right-[3px]" />
        <Plus className="size-5 text-fd-muted-foreground" />
      </a>
    );
  }

  return (
    <a
      href={sponsor.url}
      target="_blank"
      rel="noopener noreferrer"
      className="relative flex aspect-[2.5/1] items-center justify-center gap-3 border-b border-r border-fd-border px-4 transition-colors hover:bg-fd-accent/20"
    >
      <SponsorDot className="-top-[3px] -left-[3px]" />
      <SponsorDot className="-top-[3px] -right-[3px]" />
      <SponsorDot className="-bottom-[3px] -left-[3px]" />
      <SponsorDot className="-bottom-[3px] -right-[3px]" />
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
};

export const Sponsors = () => {
  const sponsorSlots = SPONSORS.slice(0, GRID_SIZE);

  return (
    <GridSection>
      <div className="border-t border-fd-border">
        <div className="px-6 py-10 md:px-10">
          <h2 className="text-2xl font-bold text-fd-foreground">Supported by the Best</h2>
          <p className="mt-2 text-sm text-fd-muted-foreground">
            Your sponsorship means a lot to open-source projects, including Vercel Doctor.
          </p>
          <a
            href={LINK.SPONSOR}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block text-sm font-medium text-fd-foreground underline underline-offset-4 transition-colors hover:text-fd-muted-foreground"
          >
            Sponsor My Work
          </a>
        </div>

        <div className="grid grid-cols-2 border-t border-fd-border sm:grid-cols-3 md:grid-cols-4">
          {sponsorSlots.map((sponsor, index) => (
            <SponsorCell key={index} sponsor={sponsor} isLastCell={index === GRID_SIZE - 1} />
          ))}
        </div>
      </div>
    </GridSection>
  );
};
