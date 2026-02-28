import { source } from "@/lib/source";
import { createFromSource } from "fumadocs-core/search/server";

export const { GET } = createFromSource(source, {
  localeMap: {
    zh: "english",
    ja: "english",
    ko: "english",
    hi: "indian",
    da: "danish",
    "pt-br": "portuguese",
  },
});
