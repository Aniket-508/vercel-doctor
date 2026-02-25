const DICEBEAR_STYLE = "lorelei";

const dicebearAvatar = (seed: string) =>
  `https://api.dicebear.com/7.x/${DICEBEAR_STYLE}/svg?seed=${encodeURIComponent(seed)}`;

export interface Testimonial {
  authorAvatar: string;
  authorName: string;
  authorTagline?: string;
  url: string;
  quote: string;
}

export const FEATURED_TESTIMONIAL: Testimonial = {
  authorAvatar: "https://unavatar.io/x/cramforce",
  authorName: "Malte Ubl",
  authorTagline: "CTO @Vercel",
  url: "https://x.com/cramforce/status/2024624151064088902",
  quote: "I love it. In fact, you can now connect it to real world usage data.",
};

export const TESTIMONIALS_ROW_ONE: Testimonial[] = [
  {
    authorAvatar: "https://unavatar.io/x/grimcodes",
    authorName: "grim",
    url: "https://x.com/grimcodes/status/2024998810578288885",
    quote: "interesting!",
  },
  {
    authorAvatar: "https://unavatar.io/x/naelodev",
    authorName: "Naelo",
    url: "https://x.com/naelodev/status/2024968195065741804",
    quote: "Will try it tomorrow! Thanks",
  },
  {
    authorAvatar: dicebearAvatar("jsthon_"),
    authorName: "jsthon",
    url: "https://www.reddit.com/r/vercel/comments/1r9umkt/comment/o6fqqys",
    quote: "Looks good!!!",
  },
  {
    authorAvatar: "https://unavatar.io/x/AmyAEgan",
    authorName: "Amy Egan",
    authorTagline: "Community @Vercel",
    url: "https://community.vercel.com/t/kept-seeing-racked-up-vercel-bills-every-now-and-then-built-a-tool-to-fix-this-once-and-for-all/34159/3?u=aniket-508",
    quote:
      "Love that you saw a problem and found a way to solve it with a very smart solution. And it's open source 😍",
  },
];

export const TESTIMONIALS_ROW_TWO: Testimonial[] = [
  {
    authorAvatar: "https://unavatar.io/x/paw_lean",
    authorName: "Pauline P. Narvas",
    authorTagline: "Community @Vercel",
    url: "https://www.reddit.com/r/vercel/comments/1r9umkt/comment/o6eycmk",
    quote: "👀 This is a great idea. Thanks for sharing!",
  },
  {
    authorAvatar: dicebearAvatar("Prestigious-Bus-8069"),
    authorName: "Prestigious-Bus-8069",
    url: "https://www.reddit.com/r/vercel/comments/1r9umkt/comment/o6f0tik",
    quote: "Need of the time, love it.",
  },
  {
    authorAvatar: dicebearAvatar("JoshSmeda"),
    authorName: "krokodil",
    url: "https://www.reddit.com/r/vercel/comments/1r9umkt/comment/o6f73bi",
    quote: "Yeah this is good. Nice work",
  },
];
