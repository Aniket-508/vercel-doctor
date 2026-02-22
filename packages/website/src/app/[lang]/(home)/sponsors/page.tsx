import { HeartHandshakeIcon } from "lucide-react";
import Image from "next/image";
import { SectionContainer, SectionContent } from "@/components/landing/section-layout";
import { Footer } from "@/components/landing/footer";
import { LINK } from "@/constants/links";
import { SPONSORS } from "@/constants/sponsors";
import type { Sponsor } from "@/constants/sponsors";
import { Button } from "@/components/ui/button";
import { getTranslation } from "@/translations";

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

const SponsorsPage = async ({ params }: { params: Promise<{ lang: string }> }) => {
  const { lang } = await params;
  const translation = getTranslation(lang);
  const activeSponsors = SPONSORS.filter(Boolean) as Sponsor[];

  return (
    <>
      <SectionContainer className="flex-1 flex flex-col">
        <SectionContent className="w-full flex-1">
          <div className="flex flex-col border-b border-fd-border items-center px-6 py-16 text-center">
            <h1 className="text-3xl font-pixel font-bold text-fd-foreground sm:text-4xl mb-2">
              {translation.sponsorsPage.heading}
            </h1>
            <p className="text-fd-muted-foreground mb-6">{translation.sponsorsPage.description}</p>
            <Button asChild>
              <a href={LINK.SPONSOR} target="_blank" rel="noopener noreferrer">
                <HeartHandshakeIcon />
                {translation.sponsorsPage.sponsorMyWork}
              </a>
            </Button>
          </div>

          {activeSponsors.length > 0 && (
            <>
              <div className="border-b border-fd-border px-6 py-3">
                <p className="text-xs font-medium uppercase tracking-widest text-fd-muted-foreground">
                  {translation.sponsorsPage.organizationSponsors}
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
                {activeSponsors.map((sponsor) => (
                  <SponsorCard key={sponsor.name} sponsor={sponsor} />
                ))}
                <EmptyCell />
              </div>
            </>
          )}

          {activeSponsors.length === 0 && (
            <div className="flex flex-col items-center gap-2 px-6 py-24 text-center text-fd-muted-foreground">
              <p className="text-sm">{translation.sponsorsPage.empty}</p>
            </div>
          )}
        </SectionContent>
      </SectionContainer>
      <Footer translation={translation} />
    </>
  );
};

export default SponsorsPage;
