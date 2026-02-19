const PERFECT_SCORE = 100;
const SCORE_GOOD_THRESHOLD = 75;
const SCORE_OK_THRESHOLD = 50;
const COMMAND = "npx -y vercel-doctor@latest .";

const API_CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const SITE = {
  NAME: "Vercel Doctor",
  URL: "https://www.vercel.doctor",
  OG_IMAGE: "/og.png",
  AUTHOR: {
    NAME: "Aniket Pawar",
    TWITTER: "@alaymanguy",
    GITHUB: "Aniket-508",
  },
  DESCRIPTION: {
    LONG: "Reduce your Vercel bill by optimizing function duration, bundle size, and platform usage. A specialized health check tool for Next.js projects on Vercel.",
    SHORT: "Optimize Next.js projects to reduce Vercel costs.",
  },
  KEYWORDS: [
    "vercel",
    "nextjs",
    "cost optimization",
    "bundle size",
    "function duration",
    "performance",
    "cold start",
    "linter",
    "static analysis",
    "doctor",
    "vercel bill",
  ],
} as const;

const LINK = {
  TWITTER: "https://x.com/alaymanguy",
  GITHUB: "https://github.com/Aniket-508/vercel-doctor",
  LICENSE: "https://github.com/Aniket-508/vercel-doctor/blob/main/LICENSE",
  SPONSOR: "https://github.com/sponsors/Aniket-508",
} as const;

export {
  API_CORS_HEADERS,
  COMMAND,
  LINK,
  PERFECT_SCORE,
  SCORE_GOOD_THRESHOLD,
  SCORE_OK_THRESHOLD,
  SITE,
};
