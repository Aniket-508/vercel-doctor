import { RootProvider } from "fumadocs-ui/provider/next";
import { defineI18nUI } from "fumadocs-ui/i18n";
import { i18n } from "@/lib/i18n";

const RTL_LANGUAGES = new Set(["ar"]);

const { provider } = defineI18nUI(i18n, {
  translations: {
    en: { displayName: "English" },
    es: { displayName: "Español", search: "Buscar documentación" },
    zh: { displayName: "中文", search: "搜索文档" },
    ja: { displayName: "日本語", search: "ドキュメントを検索" },
    fr: { displayName: "Français", search: "Rechercher la documentation" },
    de: { displayName: "Deutsch", search: "Dokumentation durchsuchen" },
    pt: { displayName: "Português", search: "Pesquisar documentação" },
    ko: { displayName: "한국어", search: "문서 검색" },
    ar: { displayName: "العربية", search: "البحث في الوثائق" },
    hi: { displayName: "हिन्दी", search: "दस्तावेज़ खोजें" },
  },
});

const LangLayout = async ({
  params,
  children,
}: {
  params: Promise<{ lang: string }>;
  children: React.ReactNode;
}) => {
  const { lang } = await params;
  const isRtl = RTL_LANGUAGES.has(lang);

  return (
    <div dir={isRtl ? "rtl" : "ltr"}>
      <RootProvider i18n={provider(lang)}>{children}</RootProvider>
    </div>
  );
};

export default LangLayout;
