import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/next"
import "./globals.css";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  display: "swap",
});

const nyght = localFont({
  variable: "--font-nyght",
  display: "swap",
  fallback: ["Iowan Old Style", "Georgia", "Times New Roman", "serif"],
  src: [
    {
      path: "./fonts/NyghtSerif-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/NyghtSerif-RegularItalic.woff2",
      weight: "400",
      style: "italic",
    },
  ],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const title = "PhaseRoll — Remember life in phases.";
const description =
  "Organize your memories by life's chapters, not camera rolls. Capture photos, record voice memories, and relive what mattered.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  openGraph: {
    title,
    description,
    url: siteUrl,
    siteName: "PhaseRoll",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    creator: "@phaseroll",
  },
};

export const viewport: Viewport = {
  themeColor: "#FFFFFF",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geist.variable} ${nyght.variable}`}>
      <head>
        <link rel="icon" type="image/png" href="/favicons/favicon-96x96.png" sizes="96x96" />
        <link rel="icon" type="image/svg+xml" href="/favicons/favicon.svg" />
        <link rel="shortcut icon" href="/favicons/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/favicons/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-title" content="PhaseRoll" />
        <link rel="manifest" href="/favicons/site.webmanifest" />
      </head>
      <body>
        <noscript>
          <style>{`.reveal { opacity: 1 }`}</style>
        </noscript>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
