import { ExternalLinkIcon } from "lucide-react";
import type { Metadata } from "next";

import { TweetGrid } from "@/components/horrors/tweet-grid";
import { Footer } from "@/components/landing/footer";
import {
  SectionContainer,
  SectionContent,
} from "@/components/landing/section-layout";
import { Button } from "@/components/ui/button";
import { LINK } from "@/constants/links";
import { ROUTES } from "@/constants/routes";
import { i18n } from "@/i18n/config";
import { withLocalePrefix } from "@/i18n/navigation";
import { createMetadata } from "@/seo/metadata";
import { getTranslation } from "@/translations";

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
    canonical: withLocalePrefix(lang, ROUTES.HORRORS),
    description: translation.horrorsPage.description,
    title: translation.horrorsPage.heading,
  });
};

const HorrorsPage = async ({
  params,
}: {
  params: Promise<{ lang: string }>;
}) => {
  const { lang } = await params;
  const translation = getTranslation(lang);

  return (
    <>
      <SectionContainer className="flex flex-1 flex-col">
        <SectionContent className="w-full flex-1">
          <div className="border-fd-border flex flex-col items-center border-b px-6 py-16 text-center">
            <h1 className="font-pixel text-fd-foreground mb-2 text-3xl font-bold sm:text-4xl">
              {translation.horrorsPage.heading}
            </h1>
            <p className="text-fd-muted-foreground mb-6">
              {translation.horrorsPage.description}
            </p>
            <Button asChild>
              <a
                href={`${LINK.GITHUB}/issues/new?title=Horrors+submission&body=Tweet+URL:%0AWhat+happened:`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {translation.horrorsPage.shareYourStory}
                <ExternalLinkIcon />
              </a>
            </Button>
          </div>

          <div className="p-5">
            <TweetGrid />
          </div>
        </SectionContent>
      </SectionContainer>
      <Footer translation={translation} />
    </>
  );
};

export default HorrorsPage;
