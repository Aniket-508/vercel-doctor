import { RootProvider } from "fumadocs-ui/provider/next";
import { Analytics } from "@vercel/analytics/next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { GeistPixelGrid } from "geist/font/pixel";
import { baseMetadata } from "@/seo/metadata";
import { JsonLdScripts } from "@/seo/json-ld";
import "./global.css";

const fontClassNames = [GeistSans.variable, GeistMono.variable, GeistPixelGrid.variable].join(" ");

export const metadata = baseMetadata;

export default function Layout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={fontClassNames} suppressHydrationWarning>
      <head>
        <JsonLdScripts />
      </head>
      <body className="flex min-h-screen flex-col font-sans antialiased">
        <RootProvider>{children}</RootProvider>
        <Analytics />
      </body>
    </html>
  );
}
