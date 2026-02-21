import { RootProvider } from "fumadocs-ui/provider/next";
import { Analytics } from "@vercel/analytics/next";
import { Inter } from "next/font/google";
import { baseMetadata } from "@/seo/metadata";
import { JsonLdScripts } from "@/seo/json-ld";
import "./global.css";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata = baseMetadata;

export default function Layout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <head>
        <JsonLdScripts />
      </head>
      <body className="flex min-h-screen flex-col">
        <RootProvider>{children}</RootProvider>
        <Analytics />
      </body>
    </html>
  );
}
