import { LINK } from "@/constants/links";
import { SITE } from "@/constants/site";
import { XIcon, LlmsIcon } from "@/components/icons";
import type { Translation } from "@/translations";

interface FooterProps {
  translation: Translation;
}

export const Footer = ({ translation }: FooterProps) => (
  <footer className="border-t border-fd-border mt-auto">
    <div className="mx-auto flex max-w-fd-container flex-col items-center justify-between gap-4 px-4 md:px-12 py-6 text-sm text-fd-muted-foreground sm:flex-row">
      <p className="text-center sm:text-left">
        {translation.footer.builtBy}{" "}
        <a
          href={LINK.PORTFOLIO}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-fd-foreground underline underline-offset-4"
        >
          {SITE.AUTHOR.NAME}
        </a>
        . {translation.footer.hostedOn}{" "}
        <a
          href="https://vercel.com"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-fd-foreground underline underline-offset-4"
        >
          Vercel
        </a>
        . {translation.footer.sourceAvailableOn}{" "}
        <a
          href={LINK.GITHUB}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-fd-foreground underline underline-offset-4"
        >
          GitHub
        </a>
        .
      </p>

      <div className="flex items-center gap-4">
        <a
          href={LINK.TWITTER}
          target="_blank"
          rel="noopener noreferrer"
          className="transition-colors hover:text-fd-foreground"
          aria-label={translation.footer.twitter}
        >
          <XIcon className="size-4" />
        </a>
        <a
          href={LINK.LLMS}
          className="transition-colors hover:text-fd-foreground"
          aria-label={translation.footer.llms}
        >
          <LlmsIcon className="size-4" />
        </a>
      </div>
    </div>
  </footer>
);
