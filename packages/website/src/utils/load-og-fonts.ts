import type { Font } from "@takumi-rs/core";

const GOOGLE_FONTS_CSS_URL = "https://fonts.googleapis.com/css2";
const OG_FONT_WEIGHTS = [400, 600, 800];

const LOCALE_FONT_FAMILY: Record<string, string> = {
  zh: "Noto Sans SC",
  ja: "Noto Sans JP",
  ko: "Noto Sans KR",
  ar: "Noto Sans Arabic",
  hi: "Noto Sans Devanagari",
  ru: "Noto Sans",
  uk: "Noto Sans",
};

const fontCache = new Map<string, Font[]>();

const parseFontEntries = (cssText: string): { url: string; weight: number }[] => {
  const entries: { url: string; weight: number }[] = [];
  const blockPattern =
    /@font-face\s*\{[^}]*font-weight:\s*(\d+);[^}]*src:\s*url\(([^)]+)\)[^}]*\}/g;
  let match: RegExpExecArray | null;

  while ((match = blockPattern.exec(cssText)) !== null) {
    entries.push({ weight: Number(match[1]), url: match[2] });
  }

  return entries;
};

const fetchFontsFromGoogle = async (family: string, weights: number[]): Promise<Font[]> => {
  const weightParam = weights.join(";");
  const cssUrl = `${GOOGLE_FONTS_CSS_URL}?family=${encodeURIComponent(family)}:wght@${weightParam}`;

  const cssResponse = await fetch(cssUrl, {
    headers: {
      // HACK: Google Fonts returns woff2 by default; TrueType user-agent gives us full .ttf files
      "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
    },
  });
  const cssText = await cssResponse.text();
  const entries = parseFontEntries(cssText);

  if (entries.length === 0) {
    throw new Error(`No font entries found for ${family}`);
  }

  return Promise.all(
    entries.map(async (entry) => {
      const fontData = await fetch(entry.url).then((response) => response.arrayBuffer());
      return { name: family, data: fontData, weight: entry.weight };
    }),
  );
};

export const loadFontsForLocale = async (locale: string): Promise<Font[]> => {
  const family = LOCALE_FONT_FAMILY[locale];
  if (!family) return [];

  const cached = fontCache.get(locale);
  if (cached) return cached;

  const fonts = await fetchFontsFromGoogle(family, OG_FONT_WEIGHTS);
  fontCache.set(locale, fonts);
  return fonts;
};
