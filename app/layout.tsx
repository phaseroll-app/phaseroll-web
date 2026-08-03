import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/next"
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TITLE,
  SITE_URL,
} from "./site";
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

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  keywords: [
    "memory journal app",
    "photo journal app",
    "digital photo album",
    "voice notes on photos",
    "progress tracking app",
    "shared event album",
  ],
  alternates: {
    canonical: "/",
  },
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "lifestyle",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    site: "@phaseroll",
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
