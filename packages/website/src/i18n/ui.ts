import { defineI18nUI } from "fumadocs-ui/i18n";

import { i18n } from "@/i18n/config";

const TRANSLATIONS = {
  ar: { displayName: "العربية", search: "البحث في الوثائق" },
  da: { displayName: "Dansk", search: "Søg i dokumentation" },
  de: { displayName: "Deutsch", search: "Dokumentation durchsuchen" },
  en: { displayName: "English" },
  es: { displayName: "Español", search: "Buscar documentación" },
  fr: { displayName: "Français", search: "Rechercher la documentation" },
  hi: { displayName: "हिन्दी", search: "दस्तावेज़ खोजें" },
  id: { displayName: "Bahasa Indonesia", search: "Cari dokumentasi" },
  it: { displayName: "Italiano", search: "Cerca documentazione" },
  ja: { displayName: "日本語", search: "ドキュメントを検索" },
  ko: { displayName: "한국어", search: "문서 검색" },
  pt: { displayName: "Português", search: "Pesquisar documentação" },
  "pt-BR": {
    displayName: "Português do Brasil",
    search: "Pesquisar documentação",
  },
  ru: { displayName: "Русский", search: "Поиск документации" },
  tr: { displayName: "Türkçe", search: "Belgelerde ara" },
  uk: { displayName: "Українська", search: "Пошук документації" },
  zh: { displayName: "简体中文", search: "搜索文档" },
} as const;

export const { provider } = defineI18nUI(i18n, { translations: TRANSLATIONS });
