import type { Language } from "@/lib/i18n";
import { en } from "./en";
import { es } from "./es";
import { zh } from "./zh";
import { ja } from "./ja";
import { fr } from "./fr";
import { de } from "./de";
import { pt } from "./pt";
import { ko } from "./ko";
import { ar } from "./ar";
import { hi } from "./hi";

export interface Translation {
  nav: {
    docs: string;
    showcase: string;
    sponsors: string;
  };
  hero: {
    copied: string;
    copyCommand: string;
    selectPackageManager: string;
    headingLine1: string;
    headingLine2: string;
    subtitle: string;
    fixCosts: string;
    github: string;
  };
  testimonials: {
    sectionLabel: string;
  };
  preFooter: {
    sectionLabel: string;
    heading: string;
    by: string;
    getStarted: string;
    viewOnGithub: string;
  };
  footer: {
    builtBy: string;
    hostedOn: string;
    sourceAvailableOn: string;
    twitter: string;
    llms: string;
  };
  disclaimer: {
    text: string;
  };
  sponsorsSection: {
    heading: string;
    description: string;
    sponsorMyWork: string;
  };
  showcasePage: {
    heading: string;
    description: string;
    suggestYours: string;
    empty: string;
  };
  sponsorsPage: {
    heading: string;
    description: string;
    sponsorMyWork: string;
    organizationSponsors: string;
    empty: string;
  };
  notFound: {
    heading: string;
    description: string;
    goHome: string;
    explore: string;
  };
  score: {
    great: string;
    needsWork: string;
    critical: string;
  };
  fumadocs: {
    displayName: string;
    search: string;
  };
}

const translations: Record<Language, Translation> = {
  en,
  es,
  zh,
  ja,
  fr,
  de,
  pt,
  ko,
  ar,
  hi,
};

export const getTranslation = (locale: string): Translation =>
  translations[locale as Language] ?? en;

export const getLocalizedPath = (locale: string, path: string): string => {
  if (locale === "en") return path;
  return `/${locale}${path}`;
};
