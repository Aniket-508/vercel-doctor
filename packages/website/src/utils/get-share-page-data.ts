import clampScore from "@/utils/clamp-score";

export interface ShareSearchParams {
  p?: string;
  s?: string;
  e?: string;
  w?: string;
  f?: string;
}

interface ShareSearchParamsRecord {
  [key: string]: string | string[] | undefined;
}

export interface SharePageData {
  projectName: string | null;
  score: number;
  errorCount: number;
  warningCount: number;
  fileCount: number;
  searchParamsString: string;
}

const getSingleQueryValue = (queryValue: string | string[] | undefined): string | undefined => {
  if (typeof queryValue === "string") return queryValue;
  if (!queryValue || queryValue.length === 0) return undefined;
  return queryValue[0];
};

export const getShareSearchParamsFromRecord = (
  shareSearchParamsRecord: ShareSearchParamsRecord,
): ShareSearchParams => {
  return {
    p: getSingleQueryValue(shareSearchParamsRecord.p),
    s: getSingleQueryValue(shareSearchParamsRecord.s),
    e: getSingleQueryValue(shareSearchParamsRecord.e),
    w: getSingleQueryValue(shareSearchParamsRecord.w),
    f: getSingleQueryValue(shareSearchParamsRecord.f),
  };
};

export const getSharePageData = (shareSearchParams: ShareSearchParams): SharePageData => {
  const projectName = shareSearchParams.p ?? null;
  const score = clampScore(Number(shareSearchParams.s) || 0);
  const errorCount = Math.max(0, Number(shareSearchParams.e) || 0);
  const warningCount = Math.max(0, Number(shareSearchParams.w) || 0);
  const fileCount = Math.max(0, Number(shareSearchParams.f) || 0);

  const normalizedSearchParams = new URLSearchParams();
  if (shareSearchParams.p) normalizedSearchParams.set("p", shareSearchParams.p);
  if (shareSearchParams.s) normalizedSearchParams.set("s", shareSearchParams.s);
  if (shareSearchParams.e) normalizedSearchParams.set("e", shareSearchParams.e);
  if (shareSearchParams.w) normalizedSearchParams.set("w", shareSearchParams.w);
  if (shareSearchParams.f) normalizedSearchParams.set("f", shareSearchParams.f);

  return {
    projectName,
    score,
    errorCount,
    warningCount,
    fileCount,
    searchParamsString: normalizedSearchParams.toString(),
  };
};
