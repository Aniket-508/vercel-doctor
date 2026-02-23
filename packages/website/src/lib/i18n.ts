import { defineI18n } from "fumadocs-core/i18n";
import { defineI18nUI } from "fumadocs-ui/i18n";

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

export const { provider } = defineI18nUI(i18n, {
  translations: {
    en: { displayName: "English" },
    es: { displayName: "Español", search: "Buscar documentación" },
    zh: { displayName: "简体中文", search: "搜索文档" },
    ja: { displayName: "日本語", search: "ドキュメントを検索" },
    fr: { displayName: "Français", search: "Rechercher la documentation" },
    de: { displayName: "Deutsch", search: "Dokumentation durchsuchen" },
    pt: { displayName: "Português", search: "Pesquisar documentação" },
    "pt-br": {
      displayName: "Português do Brasil",
      search: "Pesquisar documentação",
    },
    ko: { displayName: "한국어", search: "문서 검색" },
    ar: { displayName: "العربية", search: "البحث في الوثائق" },
    hi: { displayName: "हिन्दी", search: "दस्तावेज़ खोजें" },
    it: { displayName: "Italiano", search: "Cerca documentazione" },
    id: { displayName: "Bahasa Indonesia", search: "Cari dokumentasi" },
    tr: { displayName: "Türkçe", search: "Belgelerde ara" },
    ru: { displayName: "Русский", search: "Поиск документации" },
    da: { displayName: "Dansk", search: "Søg i dokumentation" },
    uk: { displayName: "Українська", search: "Пошук документації" },
  },
});
