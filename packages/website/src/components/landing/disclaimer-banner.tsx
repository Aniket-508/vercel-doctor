import type { Translation } from "@/translations";

interface DisclaimerBannerProps {
  translation: Translation;
}

export const DisclaimerBanner = ({ translation }: DisclaimerBannerProps) => (
  <div className="w-full border-b border-fd-border bg-fd-muted/50 py-2 text-center text-sm text-fd-muted-foreground">
    {translation.disclaimer.text}{" "}
    <a
      href="https://vercel.com"
      target="_blank"
      rel="noopener noreferrer"
      className="font-medium text-fd-foreground underline underline-offset-4"
    >
      Vercel
    </a>
    .
  </div>
);
