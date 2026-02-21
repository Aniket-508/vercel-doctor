import Image from "next/image";
import { Rss } from "lucide-react";
import { LINK, SITE } from "./constants";

const XIcon = () => (
  <svg viewBox="0 0 24 24" className="size-4 fill-current" aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const LlmsIcon = () => (
  <svg viewBox="0 0 24 24" className="size-4 fill-current" aria-hidden="true">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
  </svg>
);

export const Footer = () => (
  <footer className="border-t border-fd-border">
    <div className="mx-auto flex max-w-fd-container flex-col items-center justify-between gap-4 px-6 py-6 text-sm text-fd-muted-foreground sm:flex-row">
      <div className="flex items-center gap-3">
        <Image
          src="/vercel-doctor-logo-light.svg"
          alt="Vercel Doctor"
          width={180}
          height={40}
          className="hidden dark:block h-5 w-auto"
        />
        <Image
          src="/vercel-doctor-logo-dark.svg"
          alt="Vercel Doctor"
          width={180}
          height={40}
          className="block dark:hidden h-5 w-auto"
        />
      </div>
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
          <XIcon />
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
          <LlmsIcon />
        </a>
      </div>
    </div>
  </footer>
);
