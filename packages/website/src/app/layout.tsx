import { Analytics } from "@vercel/analytics/next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { GeistPixelGrid } from "geist/font/pixel";
import { baseMetadata } from "@/seo/metadata";
import { JsonLdScripts } from "@/seo/json-ld";
import "./global.css";
import { i18n } from "@/lib/i18n";

const fontClassNames = [GeistSans.variable, GeistMono.variable, GeistPixelGrid.variable].join(" ");

export const metadata = baseMetadata;

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang={i18n.defaultLanguage} className={fontClassNames} suppressHydrationWarning>
      <head>
        <JsonLdScripts />
      </head>
      <body className="flex min-h-screen flex-col font-sans antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
};

export default RootLayout;
