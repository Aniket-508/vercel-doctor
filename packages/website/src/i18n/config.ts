import { defineI18n } from "fumadocs-core/i18n";

const RTL_LANGUAGES = new Set(["ar"]);

export const i18n = defineI18n({
  defaultLanguage: "en",
  hideLocale: "default-locale",
  languages: [
    "en",
    "es",
    "zh",
    "ja",
    "fr",
    "de",
    "pt",
    "pt-BR",
    "ko",
    "ar",
    "hi",
    "it",
    "id",
    "tr",
    "ru",
    "da",
    "uk",
  ],
  parser: "dir",
});

export type Locale = (typeof i18n.languages)[number];

export const isLocale = (value: string): value is Locale =>
  i18n.languages.includes(value as Locale);

export const isRtlLocale = (locale: string): boolean =>
  RTL_LANGUAGES.has(locale);
