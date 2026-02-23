"use client";

import { useState } from "react";
import { SITE } from "@/constants/site";
import { Button } from "@/components/ui/button";
import { getLocalizedPath } from "@/translations";
import type { Translation } from "@/translations";

const COPY_FEEDBACK_DURATION_MS = 2000;

interface BadgeSnippetProps {
  searchParamsString: string;
  lang: string;
  translation: Translation;
}

const BadgeSnippet = ({ searchParamsString, lang, translation }: BadgeSnippetProps) => {
  const [didCopy, setDidCopy] = useState(false);

  const sharePath = getLocalizedPath(lang, "/share");
  const badgePath = "/share/badge";
  const badgeFullUrl = `${SITE.URL}${badgePath}?${searchParamsString}`;
  const shareFullUrl = `${SITE.URL}${sharePath}?${searchParamsString}`;
  const badgePreviewPath = `${badgePath}?${searchParamsString}`;
  const markdownSnippet = `[![Vercel Doctor](${badgeFullUrl})](${shareFullUrl})`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(markdownSnippet);
      setDidCopy(true);
      setTimeout(() => setDidCopy(false), COPY_FEEDBACK_DURATION_MS);
    } catch {}
  };

  return (
    <div className="mt-8">
      <div className="text-fd-muted-foreground">{translation.share.addBadgeToReadme}</div>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={badgePreviewPath} alt="Vercel Doctor score badge" height={20} className="block" />
        <a
          href={badgePreviewPath}
          target="_blank"
          rel="noreferrer"
          className="text-xs text-fd-muted-foreground underline underline-offset-2 transition-colors hover:text-fd-foreground"
        >
          {translation.share.openSvg}
        </a>
      </div>

      <div className="mt-3 flex flex-wrap items-start gap-2">
        <code className="min-w-0 flex-1 break-all rounded-md border border-fd-border bg-fd-muted/50 px-3 py-1.5 text-xs text-fd-foreground">
          {markdownSnippet}
        </code>
        <Button type="button" variant="outline" size="sm" onClick={handleCopy} className="shrink-0">
          {didCopy ? translation.share.copied : translation.share.copy}
        </Button>
      </div>
    </div>
  );
};

export default BadgeSnippet;
