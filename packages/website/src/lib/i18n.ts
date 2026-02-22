import { defineI18n } from "fumadocs-core/i18n";

export const LANGUAGES = [
  "en",
  "es",
  "zh",
  "ja",
  "fr",
  "de",
  "pt",
  "pt-br",
  "ko",
  "ar",
  "hi",
  "it",
  "id",
  "tr",
  "ru",
  "da",
  "uk",
] as const;

export type Language = (typeof LANGUAGES)[number];

export const i18n = defineI18n({
  defaultLanguage: "en",
  languages: [...LANGUAGES],
  hideLocale: "default-locale",
});
