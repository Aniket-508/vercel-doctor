import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";

import { LogoMark } from "@/components/logo";
import { LINK } from "@/constants/links";
import { ROUTES } from "@/constants/routes";
import { i18n } from "@/i18n/config";
import { withLocalePrefix } from "@/i18n/navigation";
import { getTranslation } from "@/translations";

export const baseOptions = (locale: string): BaseLayoutProps => {
  const translation = getTranslation(locale);

  return {
    githubUrl: LINK.GITHUB,
    i18n,
    links: [
      {
        text: translation.nav.docs,
        url: withLocalePrefix(locale, ROUTES.DOCS),
      },
      {
        text: translation.nav.horrors,
        url: withLocalePrefix(locale, ROUTES.HORRORS),
      },
      {
        text: translation.nav.showcase,
        url: withLocalePrefix(locale, ROUTES.SHOWCASE),
      },
      {
        text: translation.nav.sponsors,
        url: withLocalePrefix(locale, ROUTES.SPONSORS),
      },
    ],
    nav: {
      title: (
        <>
          <LogoMark className="h-6" />
          Vercel Doctor
        </>
      ),
      url: withLocalePrefix(locale, ROUTES.HOME),
    },
  };
};
