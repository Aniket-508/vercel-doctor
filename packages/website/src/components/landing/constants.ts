const SITE = {
  NAME: "Vercel Doctor",
  URL: "https://www.vercel-doctor.com",
  OG_IMAGE: "/og.png",
  AUTHOR: {
    NAME: "Aniket Pawar",
    TWITTER: "@alaymanguy",
    GITHUB: "Aniket-508",
  },
  DESCRIPTION: {
    LONG: "Reduce your Vercel bill by optimizing function duration, caching, and platform usage. A specialized health check tool for Next.js projects on Vercel.",
    SHORT: "Optimize Next.js projects to reduce Vercel costs.",
  },
  KEYWORDS: [
    "vercel",
    "nextjs",
    "cost optimization",
    "function duration",
    "caching",
    "invocations",
    "image optimization",
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
  RSS: "/rss.xml",
  LLMS: "/llms.txt",
} as const;

const PERFECT_SCORE = 100;
const SCORE_GOOD_THRESHOLD = 75;
const SCORE_OK_THRESHOLD = 50;

const COMMAND = "npx -y vercel-doctor@latest .";

const API_CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const DEMO_VIDEO_URL =
  "https://github.com/user-attachments/assets/e03596de-4b68-4a3e-8623-51c765647b26";

interface Testimonial {
  authorAvatar: string;
  authorName: string;
  authorTagline: string;
  url: string;
  quote: string;
}

const FEATURED_TESTIMONIAL: Testimonial = {
  authorAvatar: "https://unavatar.io/x/rauchg",
  authorName: "Guillermo Rauch",
  authorTagline: "CEO @Vercel",
  url: "https://x.com/rauchg",
  quote: "This is exactly the kind of tooling the ecosystem needs. Love the approach.",
};

const TESTIMONIALS_ROW_ONE: Testimonial[] = [
  {
    authorAvatar: "https://unavatar.io/x/steventey",
    authorName: "Steven Tey",
    authorTagline: "Founder @Dub.co",
    url: "https://x.com/steventey",
    quote: "whoa, this is really dope. Every Next.js team should run this.",
  },
  {
    authorAvatar: "https://unavatar.io/x/kapehe_ok",
    authorName: "Kap",
    authorTagline: "Head of DevRel @Vercel",
    url: "https://x.com/kapehe_ok",
    quote: "One of my favorite projects. You are crushing it!",
  },
  {
    authorAvatar: "https://unavatar.io/x/leeerob",
    authorName: "Lee Robinson",
    authorTagline: "VP of Product @Vercel",
    url: "https://x.com/leeerob",
    quote: "Great diagnostics tool. Helps teams understand where their costs come from.",
  },
  {
    authorAvatar: "https://unavatar.io/x/shadcn",
    authorName: "shadcn",
    authorTagline: "Creator of shadcn/ui",
    url: "https://x.com/shadcn",
    quote: "Clean CLI experience. Love the score breakdown.",
  },
];

const TESTIMONIALS_ROW_TWO: Testimonial[] = [
  {
    authorAvatar: "https://unavatar.io/x/orcdev",
    authorName: "OrcDev",
    authorTagline: "Creator of 8bitcn.com",
    url: "https://x.com/orcdev",
    quote: "Seriously useful. Found savings I didn't know existed.",
  },
  {
    authorAvatar: "https://unavatar.io/x/jordwalke",
    authorName: "jordwalke",
    authorTagline: "Creator of React",
    url: "https://x.com/jordwalke",
    quote: "Looks great. Nice work on the developer experience.",
  },
  {
    authorAvatar: "https://unavatar.io/x/iamsahaj_xyz",
    authorName: "Sahaj",
    authorTagline: "Creator of tweakcn.com",
    url: "https://x.com/iamsahaj_xyz",
    quote: "One of the best DX tools I've seen for Vercel optimization.",
  },
  {
    authorAvatar: "https://unavatar.io/x/mannupaaji",
    authorName: "Manu Arora",
    authorTagline: "Creator of aceternity.com",
    url: "https://x.com/mannupaaji",
    quote: "Great work. The terminal output is so polished.",
  },
];

interface Sponsor {
  name: string;
  logoUrl: string;
  url: string;
}

const SPONSORS: (Sponsor | null)[] = [
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
];

interface ShowcaseProject {
  name: string;
  url: string;
  description?: string;
}

const SHOWCASE_PROJECTS: ShowcaseProject[] = [];

export {
  API_CORS_HEADERS,
  COMMAND,
  DEMO_VIDEO_URL,
  FEATURED_TESTIMONIAL,
  LINK,
  PERFECT_SCORE,
  SCORE_GOOD_THRESHOLD,
  SCORE_OK_THRESHOLD,
  SHOWCASE_PROJECTS,
  SITE,
  SPONSORS,
  TESTIMONIALS_ROW_ONE,
  TESTIMONIALS_ROW_TWO,
};
export type { ShowcaseProject, Sponsor, Testimonial };
