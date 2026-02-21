import type { MetadataRoute } from "next";
import { SITE } from "@/constants/site";

const robots = (): MetadataRoute.Robots => ({
  rules: [
    {
      userAgent: "*",
      allow: "/",
    },
  ],
  sitemap: `${SITE.URL}/sitemap.xml`,
});

export default robots;
