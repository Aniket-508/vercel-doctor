import { createMDX } from "fumadocs-mdx/next";

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "unavatar.io" },
      { protocol: "https", hostname: "api.dicebear.com" },
    ],
  },
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/",
          destination: "/llms.txt",
          has: [
            {
              type: "header",
              key: "accept",
              value: "(.*)text/markdown(.*)",
            },
          ],
        },
        {
          source: "/llm.txt",
          destination: "/llms.txt",
        },
        {
          source: "/docs/:path*",
          destination: "/llms.mdx/docs/:path*",
          has: [
            {
              type: "header",
              key: "accept",
              value: "(.*)text/markdown(.*)",
            },
          ],
        },
        {
          source: "/docs/:path*\\.mdx",
          destination: "/llms.mdx/docs/:path*",
        },
        {
          source: "/install-skill.sh",
          destination: "/install-skill",
        },
      ],
    };
  },
};

export default withMDX(config);
