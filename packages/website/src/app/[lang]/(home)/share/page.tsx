import type { Metadata } from "next";

import DoctorFace from "@/components/doctor-face";
import { LinkedInIcon, XIcon } from "@/components/icons";
import { Footer } from "@/components/landing/footer";
import {
  SectionContainer,
  SectionContent,
} from "@/components/landing/section-layout";
import AnimatedScore from "@/components/share/animated-score";
import BadgeSnippet from "@/components/share/badge-snippet";
import { Button } from "@/components/ui/button";
import { COMMAND } from "@/constants/command";
import { ROUTES } from "@/constants/routes";
import { PERFECT_SCORE } from "@/constants/score";
import { SITE } from "@/constants/site";
import { withLocalePrefix } from "@/i18n/navigation";
import { createMetadata } from "@/seo/metadata";
import { getTranslation } from "@/translations";
import getScoreColorClass from "@/utils/get-score-color-class";
import getScoreLabel from "@/utils/get-score-label";
import {
  getSharePageData,
  getShareSearchParamsFromRecord,
} from "@/utils/get-share-page-data";
import getTranslatedScoreLabel from "@/utils/get-translated-score-label";

interface SharePageProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const getShareBaseUrl = (lang: string) =>
  `${SITE.URL}${withLocalePrefix(lang, ROUTES.SHARE)}`;

export const generateMetadata = async ({
  params,
  searchParams,
}: SharePageProps): Promise<Metadata> => {
  const { lang } = await params;
  const sharePageData = getSharePageData(
    getShareSearchParamsFromRecord(await searchParams),
  );
  const { projectName, score, errorCount, warningCount, searchParamsString } =
    sharePageData;

  const label = getScoreLabel(score);
  const titlePrefix = projectName ? `${projectName} - ` : "";
  const title = `${titlePrefix}Score: ${score}/${PERFECT_SCORE} (${label})`;

  const descriptionParts: string[] = [];
  if (errorCount > 0) {
    descriptionParts.push(`${errorCount} error${errorCount === 1 ? "" : "s"}`);
  }
  if (warningCount > 0) {
    descriptionParts.push(
      `${warningCount} warning${warningCount === 1 ? "" : "s"}`,
    );
  }
  const description =
    descriptionParts.length > 0
      ? `${descriptionParts.join(", ")} found. ${SITE.DESCRIPTION.SHARE}`
      : SITE.DESCRIPTION.SHARE;

  return createMetadata({
    canonical: withLocalePrefix(lang, ROUTES.SHARE),
    description,
    ogImageAlt: `${SITE.NAME} - Score preview`,
    ogImageUrl: `/share/og?${searchParamsString}`,
    title,
  });
};

export const SharePage = async ({ params, searchParams }: SharePageProps) => {
  const { lang } = await params;

  const {
    projectName,
    score,
    errorCount,
    warningCount,
    fileCount,
    searchParamsString,
  } = getSharePageData(getShareSearchParamsFromRecord(await searchParams));
  const colorClass = getScoreColorClass(score);
  const shareBaseUrl = getShareBaseUrl(lang);
  const shareUrl = `${shareBaseUrl}?${searchParamsString}`;

  const translation = getTranslation(lang);
  const translatedLabel = getTranslatedScoreLabel(score, translation);

  const projectLabel = projectName
    ? `${projectName} `
    : translation.share.myProject;
  const tweetText = `${projectLabel}scored ${score}/${PERFECT_SCORE} (${translatedLabel}) ${translation.share.tweetSuffix}`;
  const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    tweetText,
  )}&url=${encodeURIComponent(shareUrl)}`;
  const linkedinShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
    shareUrl,
  )}`;

  return (
    <>
      <SectionContainer className="flex flex-1 flex-col">
        <SectionContent className="flex w-full flex-1 flex-col gap-8 px-4 py-8 md:px-12 md:py-16">
          <div className="space-y-3">
            <div className="mb-6">
              {projectName && (
                <div className="text-fd-foreground mb-2 text-xl">
                  {projectName}
                </div>
              )}
              <DoctorFace score={score} />
              <div className="text-fd-muted-foreground mt-2">
                {SITE.NAME}{" "}
                <span className="text-fd-muted-foreground/80">
                  ({SITE.URL.replace(/^https?:\/\//, "")})
                </span>
              </div>
            </div>

            <AnimatedScore targetScore={score} />

            {(errorCount > 0 || warningCount > 0 || fileCount > 0) && (
              <>
                {errorCount > 0 && (
                  <span className={colorClass}>
                    {errorCount}{" "}
                    {errorCount === 1
                      ? translation.share.error
                      : translation.share.errors}
                  </span>
                )}
                {warningCount > 0 && (
                  <span className="text-yellow-500">
                    {"  "}
                    {warningCount}{" "}
                    {warningCount === 1
                      ? translation.share.warning
                      : translation.share.warnings}
                  </span>
                )}
                {fileCount > 0 && (
                  <span className="text-fd-muted-foreground">
                    {"  "}
                    {translation.share.across} {fileCount}{" "}
                    {fileCount === 1
                      ? translation.share.file
                      : translation.share.files}
                  </span>
                )}
              </>
            )}
          </div>

          <div className="space-y-3">
            <div className="text-fd-muted-foreground">
              {translation.share.runOnCodebase}
            </div>

            <code className="border-fd-border bg-fd-muted/50 text-fd-foreground inline-block rounded-md border px-3 py-1.25">
              {COMMAND}
            </code>

            <div className="flex flex-wrap items-center gap-3">
              <Button asChild variant="default">
                <a href={twitterShareUrl} target="_blank" rel="noreferrer">
                  <XIcon />
                  {translation.share.shareOnX}
                </a>
              </Button>
              <Button asChild variant="outline">
                <a href={linkedinShareUrl} target="_blank" rel="noreferrer">
                  <LinkedInIcon />
                  {translation.share.shareOnLinkedIn}
                </a>
              </Button>
            </div>
          </div>

          <BadgeSnippet
            searchParamsString={searchParamsString}
            lang={lang}
            translation={translation}
          />
        </SectionContent>
      </SectionContainer>
      <Footer translation={translation} />
    </>
  );
};

export default SharePage;
