import { RootProvider } from "fumadocs-ui/provider/next";
import { provider } from "@/lib/i18n";

const RTL_LANGUAGES = new Set(["ar"]);

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
    <RootProvider i18n={provider(lang)} dir={isRtl ? "rtl" : "ltr"}>
      {children}
    </RootProvider>
  );
};

export default LangLayout;
