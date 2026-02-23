import type { Metadata } from "next";
import { COMMAND } from "@/constants/command";
import { PERFECT_SCORE } from "@/constants/score";
import { SITE } from "@/constants/site";
import getScoreLabel from "@/utils/get-score-label";
import getScoreColorClass from "@/utils/get-score-color-class";
import { getSharePageData, type ShareSearchParams } from "@/utils/get-share-page-data";
import DoctorFace from "@/components/doctor-face";
import { Button } from "@/components/ui/button";
import { SectionContainer, SectionContent } from "@/components/landing/section-layout";
import { Footer } from "@/components/landing/footer";
import { getTranslation, getLocalizedPath } from "@/translations";
import getTranslatedScoreLabel from "@/utils/get-translated-score-label";
import AnimatedScore from "./animated-score";
import BadgeSnippet from "./badge-snippet";
import { LinkedInIcon, XIcon } from "@/components/icons";

const getShareBaseUrl = (lang: string) => `${SITE.URL}${getLocalizedPath(lang, "/share")}`;

export const generateMetadata = async ({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<ShareSearchParams>;
}): Promise<Metadata> => {
  await params;
  const sharePageData = getSharePageData(await searchParams);
  const { projectName, score, errorCount, warningCount, searchParamsString } = sharePageData;
  const label = getScoreLabel(score);

  const titlePrefix = projectName ? `${projectName} - ` : "";
  const title = `Vercel Doctor - ${titlePrefix}Score: ${score}/${PERFECT_SCORE} (${label})`;
  const descriptionParts: string[] = [];
  if (errorCount > 0) descriptionParts.push(`${errorCount} error${errorCount === 1 ? "" : "s"}`);
  if (warningCount > 0)
    descriptionParts.push(`${warningCount} warning${warningCount === 1 ? "" : "s"}`);
  const description =
    descriptionParts.length > 0
      ? `${descriptionParts.join(
          ", ",
        )} found. Run vercel-doctor on your codebase to reduce your Vercel bill.`
      : "Run vercel-doctor on your codebase to reduce your Vercel bill.";

  const ogImageUrl = `/share/og?${searchParamsString}`;

  return {
    title,
    description,
    openGraph: { title, description, images: [ogImageUrl] },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    },
  };
};

const SharePage = async ({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<ShareSearchParams>;
}) => {
  const { lang } = await params;
  const sharePageData = getSharePageData(await searchParams);
  const { projectName, score, errorCount, warningCount, fileCount, searchParamsString } =
    sharePageData;
  const colorClass = getScoreColorClass(score);
  const shareBaseUrl = getShareBaseUrl(lang);
  const shareUrl = `${shareBaseUrl}?${searchParamsString}`;

  const translation = getTranslation(lang);
  const translatedLabel = getTranslatedScoreLabel(score, translation);

  const projectLabel = projectName ? `${projectName} ` : translation.share.myProject;
  const tweetText = `${projectLabel}scored ${score}/${PERFECT_SCORE} (${translatedLabel}) ${translation.share.tweetSuffix}`;
  const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    tweetText,
  )}&url=${encodeURIComponent(shareUrl)}`;
  const linkedinShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
    shareUrl,
  )}`;

  return (
    <>
      <SectionContainer className="flex-1 flex flex-col">
        <SectionContent className="w-full flex flex-col flex-1 gap-6 px-4 py-8 md:px-12 md:py-16">
          <div className="mb-2">
            {projectName && <div className="mb-4 text-xl text-fd-foreground">{projectName}</div>}
            <DoctorFace score={score} />
            <div className="mt-2 text-fd-muted-foreground">
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
                  {errorCount === 1 ? translation.share.error : translation.share.errors}
                </span>
              )}
              {warningCount > 0 && (
                <span className="text-yellow-500">
                  {"  "}
                  {warningCount}{" "}
                  {warningCount === 1 ? translation.share.warning : translation.share.warnings}
                </span>
              )}
              {fileCount > 0 && (
                <span className="text-fd-muted-foreground">
                  {"  "}
                  {translation.share.across} {fileCount}{" "}
                  {fileCount === 1 ? translation.share.file : translation.share.files}
                </span>
              )}
            </>
          )}

          <div className="text-fd-muted-foreground">{translation.share.runOnCodebase}</div>
          <div>
            <code className="inline-block rounded-md border border-fd-border bg-fd-muted/50 px-3 py-1.5 text-fd-foreground">
              {COMMAND}
            </code>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button asChild variant="default" size="sm">
              <a href={twitterShareUrl} target="_blank" rel="noreferrer">
                <XIcon />
                {translation.share.shareOnX}
              </a>
            </Button>
            <Button asChild variant="outline" size="sm">
              <a href={linkedinShareUrl} target="_blank" rel="noreferrer">
                <LinkedInIcon />
                {translation.share.shareOnLinkedIn}
              </a>
            </Button>
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
