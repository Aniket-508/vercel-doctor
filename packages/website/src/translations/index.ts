import { i18n } from "@/i18n/config";

import { ar } from "./ar";
import { da } from "./da";
import { de } from "./de";
import { en } from "./en";
import { es } from "./es";
import { fr } from "./fr";
import { hi } from "./hi";
import { id } from "./id";
import { it } from "./it";
import { ja } from "./ja";
import { ko } from "./ko";
import { pt } from "./pt";
import { ptBr } from "./pt-BR";
import { ru } from "./ru";
import { tr } from "./tr";
import { uk } from "./uk";
import { zh } from "./zh";

export interface Translation {
  nav: {
    docs: string;
    horrors: string;
    showcase: string;
    sponsors: string;
  };
  horrorsPage: {
    heading: string;
    description: string;
    shareYourStory: string;
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
  share: {
    myProject: string;
    tweetSuffix: string;
    runOnCodebase: string;
    shareOnX: string;
    shareOnLinkedIn: string;
    addBadgeToReadme: string;
    openSvg: string;
    copy: string;
    copied: string;
    error: string;
    errors: string;
    warning: string;
    warnings: string;
    across: string;
    file: string;
    files: string;
  };
  fumadocs: {
    displayName: string;
    search: string;
  };
}

const translations: Record<string, Translation> = {
  ar,
  da,
  de,
  en,
  es,
  fr,
  hi,
  id,
  it,
  ja,
  ko,
  pt,
  "pt-BR": ptBr,
  ru,
  tr,
  uk,
  zh,
};

export const getTranslation = (locale: string): Translation =>
  translations[locale] ?? translations[i18n.defaultLanguage];
