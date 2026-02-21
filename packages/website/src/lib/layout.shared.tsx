import { LogoMark } from "@/components/logo";
import { LINK } from "@/constants/links";
import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";

export const baseOptions = (): BaseLayoutProps => ({
  nav: {
    title: (
      <>
        <LogoMark className="h-6" />
        Vercel Doctor
      </>
    ),
  },
  links: [
    { text: "Docs", url: "/docs" },
    { text: "Showcase", url: "/showcase" },
    { text: "Sponsors", url: "/sponsors" },
  ],
  githubUrl: LINK.GITHUB,
});
