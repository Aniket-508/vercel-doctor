import { defineI18n } from "fumadocs-core/i18n";

export const LANGUAGES = ["en", "es", "zh", "ja", "fr", "de", "pt", "ko", "ar", "hi"] as const;

export type Language = (typeof LANGUAGES)[number];

export const i18n = defineI18n({
  defaultLanguage: "en",
  languages: [...LANGUAGES],
  hideLocale: "default-locale",
});
