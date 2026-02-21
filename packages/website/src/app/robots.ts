import type { MetadataRoute } from "next";
import { SITE } from "@/components/landing/constants";

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
