import Image from "next/image";
import { Plus } from "lucide-react";
import { SectionContainer, SectionContent } from "./section-layout";
import { LINK } from "@/constants/links";
import { SPONSORS } from "@/constants/sponsors";
import type { Sponsor } from "@/constants/sponsors";
import { getTranslation } from "@/translations";
import { i18n } from "@/lib/i18n";

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

interface SponsorsProps {
  lang?: (typeof i18n.languages)[number];
}

export const Sponsors = ({ lang = i18n.defaultLanguage }: SponsorsProps) => {
  const translation = getTranslation(lang);
  const sponsorSlots = SPONSORS.slice(0, GRID_SIZE);

  return (
    <SectionContainer>
      <SectionContent>
        <div className="px-6 py-10 md:px-10">
          <h2 className="text-2xl font-bold text-fd-foreground">
            {translation.sponsorsSection.heading}
          </h2>
          <p className="mt-2 text-sm text-fd-muted-foreground">
            {translation.sponsorsSection.description}
          </p>
          <a
            href={LINK.SPONSOR}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block text-sm font-medium text-fd-foreground underline underline-offset-4 transition-colors hover:text-fd-muted-foreground"
          >
            {translation.sponsorsSection.sponsorMyWork}
          </a>
        </div>

        <div className="grid grid-cols-2 border-t border-fd-border sm:grid-cols-3 md:grid-cols-4">
          {sponsorSlots.map((sponsor, index) => (
            <SponsorCell key={index} sponsor={sponsor} isLastCell={index === GRID_SIZE - 1} />
          ))}
        </div>
      </SectionContent>
    </SectionContainer>
  );
};
