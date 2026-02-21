export interface Testimonial {
  authorAvatar: string;
  authorName: string;
  authorTagline: string;
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
    authorTagline: "",
    url: "https://x.com/grimcodes/status/2024998810578288885",
    quote: "interesting!",
  },
  {
    authorAvatar: "https://unavatar.io/x/naelodev",
    authorName: "Naelo",
    authorTagline: "",
    url: "https://x.com/naelodev/status/2024968195065741804",
    quote: "Will try it tomorrow! Thanks",
  },
  {
    authorAvatar: "https://unavatar.io/reddit/leeerob",
    authorName: "jsthon",
    authorTagline: "",
    url: "https://www.reddit.com/r/vercel/comments/1r9umkt/comment/o6fqqys",
    quote: "Looks good!!!",
  },
];

export const TESTIMONIALS_ROW_TWO: Testimonial[] = [
  {
    authorAvatar: "https://unavatar.io/reddit/paw-lean",
    authorName: "Pauline P. Narvas",
    authorTagline: "Community @Vercel",
    url: "https://www.reddit.com/r/vercel/comments/1r9umkt/comment/o6eycmk",
    quote: "👀 This is a great idea. Thanks for sharing!",
  },
  {
    authorAvatar: "https://unavatar.io/reddit/Prestigious-Bus-8069",
    authorName: "Prestigious-Bus-8069",
    authorTagline: "",
    url: "https://www.reddit.com/r/vercel/comments/1r9umkt/comment/o6f0tik",
    quote: "Need of the time, love it.",
  },
  {
    authorAvatar: "https://unavatar.io/reddit/JoshSmeda",
    authorName: "krokodil",
    authorTagline: "",
    url: "https://www.reddit.com/r/vercel/comments/1r9umkt/comment/o6f73bi",
    quote: "Yeah this is good. Nice work",
  },
];
