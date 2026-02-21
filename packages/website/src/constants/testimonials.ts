export interface Testimonial {
  authorAvatar: string;
  authorName: string;
  authorTagline: string;
  url: string;
  quote: string;
}

export const FEATURED_TESTIMONIAL: Testimonial = {
  authorAvatar: "https://unavatar.io/x/rauchg",
  authorName: "Guillermo Rauch",
  authorTagline: "CEO @Vercel",
  url: "https://x.com/rauchg",
  quote: "This is exactly the kind of tooling the ecosystem needs. Love the approach.",
};

export const TESTIMONIALS_ROW_ONE: Testimonial[] = [
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

export const TESTIMONIALS_ROW_TWO: Testimonial[] = [
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
