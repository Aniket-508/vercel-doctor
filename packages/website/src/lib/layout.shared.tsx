import { LogoMark } from "@/components/logo";
import { LINK } from "@/constants/links";
import { i18n } from "@/lib/i18n";
import { getTranslation, getLocalizedPath } from "@/translations";
import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";

export const baseOptions = (locale: string): BaseLayoutProps => {
  const translation = getTranslation(locale);

  return {
    i18n,
    nav: {
      title: (
        <>
          <LogoMark className="h-6" />
          Vercel Doctor
        </>
      ),
    },
    links: [
      { text: translation.nav.docs, url: getLocalizedPath(locale, "/docs") },
      { text: translation.nav.showcase, url: getLocalizedPath(locale, "/showcase") },
      { text: translation.nav.sponsors, url: getLocalizedPath(locale, "/sponsors") },
    ],
    githubUrl: LINK.GITHUB,
  };
};
