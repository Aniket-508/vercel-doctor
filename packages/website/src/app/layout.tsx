import type { Metadata } from "next";
import { IBM_Plex_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const SITE_URL = "https://www.vercel.doctor";
const TWITTER_IMAGE_PATH = "/vercel-doctor-og-banner.svg";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Vercel Doctor",
  description: "Let coding agents diagnose and fix your React code.",
  twitter: {
    card: "summary_large_image",
    images: [TWITTER_IMAGE_PATH],
  },
  icons: { icon: "/vercel-doctor-icon.svg" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${ibmPlexMono.variable} antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
