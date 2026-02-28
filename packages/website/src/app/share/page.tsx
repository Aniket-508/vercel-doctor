import type { Metadata } from "next";
import { HomeLayout } from "fumadocs-ui/layouts/home";
import { RootProvider } from "fumadocs-ui/provider/next";
import { i18n, provider } from "@/lib/i18n";
import { baseOptions } from "@/lib/layout.shared";
import {
  getShareSearchParamsFromRecord,
  type ShareSearchParams,
} from "@/utils/get-share-page-data";
import LocalizedSharePage, {
  generateMetadata as generateLocalizedShareMetadata,
} from "../[lang]/(home)/share/page";

const DEFAULT_LANG = i18n.defaultLanguage;

interface SharePageSearchParams {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const getNormalizedShareSearchParams = async (
  searchParams: Promise<Record<string, string | string[] | undefined>>,
): Promise<ShareSearchParams> => getShareSearchParamsFromRecord(await searchParams);

export const generateMetadata = async ({
  searchParams,
}: SharePageSearchParams): Promise<Metadata> => {
  const normalizedSearchParams = getNormalizedShareSearchParams(searchParams);

  return generateLocalizedShareMetadata({
    params: Promise.resolve({ lang: DEFAULT_LANG }),
    searchParams: normalizedSearchParams,
  });
};

const SharePage = async ({ searchParams }: SharePageSearchParams) => {
  const normalizedSearchParams = getNormalizedShareSearchParams(searchParams);

  return (
    <RootProvider i18n={provider(DEFAULT_LANG)} dir="ltr">
      <HomeLayout {...baseOptions(DEFAULT_LANG)}>
        <LocalizedSharePage
          params={Promise.resolve({ lang: DEFAULT_LANG })}
          searchParams={normalizedSearchParams}
        />
      </HomeLayout>
    </RootProvider>
  );
};

export default SharePage;
