import { createFromSource } from "fumadocs-core/search/server";

import { source } from "@/lib/source";

export const { GET } = createFromSource(source, {
  localeMap: {
    da: "danish",
    hi: "indian",
    ja: "english",
    ko: "english",
    "pt-BR": "portuguese",
    zh: "english",
  },
});
