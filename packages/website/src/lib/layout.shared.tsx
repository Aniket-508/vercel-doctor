import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import Image from "next/image";

export const gitConfig = {
  user: "Aniket-508",
  repo: "vercel-doctor",
  branch: "main",
};

export const baseOptions = (): BaseLayoutProps => ({
  nav: {
    title: (
      <>
        <Image
          src="/vercel-doctor-logo-light.svg"
          alt="Vercel Doctor"
          width={180}
          height={40}
          className="hidden dark:block h-6 w-auto"
        />
        <Image
          src="/vercel-doctor-logo-dark.svg"
          alt="Vercel Doctor"
          width={180}
          height={40}
          className="block dark:hidden h-6 w-auto"
        />
      </>
    ),
  },
  links: [
    { text: "Docs", url: "/docs" },
    { text: "Showcase", url: "/showcase" },
    { text: "Sponsors", url: "/sponsors" },
  ],
  githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
});
