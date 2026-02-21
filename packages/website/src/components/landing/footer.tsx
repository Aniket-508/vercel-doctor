import { Rss } from "lucide-react";
import { LINK } from "@/constants/links";
import { SITE } from "@/constants/site";
import { XIcon, LlmsIcon } from "@/components/icons";

export const Footer = () => (
  <footer className="border-t border-fd-border mt-auto">
    <div className="mx-auto flex max-w-fd-container flex-col items-center justify-between gap-4 px-4 md:px-12 py-6 text-sm text-fd-muted-foreground sm:flex-row">
      <p className="text-center sm:text-left">
        Built by{" "}
        <a
          href={LINK.TWITTER}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-fd-foreground underline underline-offset-4"
        >
          {SITE.AUTHOR.NAME}
        </a>
        . Hosted on{" "}
        <a
          href="https://vercel.com"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-fd-foreground underline underline-offset-4"
        >
          Vercel
        </a>
        . The source code is available on{" "}
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
          aria-label="Twitter"
        >
          <XIcon className="size-4" />
        </a>
        <a
          href={LINK.RSS}
          className="transition-colors hover:text-fd-foreground"
          aria-label="RSS Feed"
        >
          <Rss className="size-4" />
        </a>
        <a
          href={LINK.LLMS}
          className="transition-colors hover:text-fd-foreground"
          aria-label="LLMs"
        >
          <LlmsIcon className="size-4" />
        </a>
      </div>
    </div>
  </footer>
);
