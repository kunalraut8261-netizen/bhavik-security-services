import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

import ChatWidget from "@/components/ChatWidget";
import SmoothScroll from "@/components/SmoothScroll";
import CustomCursor from "@/components/CustomCursor";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import CookieBanner from "@/components/CookieBanner";

export const metadata: Metadata = {
  metadataBase: new URL("https://bhaviksecurityservice.com"),

  title: "Bhavik Security Services | सुरक्षेचा शब्द.. विश्वासाचं बंधन.!",

  description:
    "Bhavik Security Services provides top-tier Industrial Security, Security Guards, Gunman, Bouncers, and Event Security Services across Maharashtra.",

  keywords:
    "Security Services, Bhavik Security, Gunman, Bouncers, Event Security, Industrial Security, Maharashtra, Security Guards",

  authors: [{ name: "Bhavik Security Services" }],

  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },

  other: {
    "google-adsense-account": "ca-pub-3307956324818600",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <Script
          id="google-adsense"
          async
          strategy="beforeInteractive"
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3307956324818600"
          crossOrigin="anonymous"
        />
      </head>

      <body suppressHydrationWarning>
        <GoogleAnalytics GA_MEASUREMENT_ID="G-XXXXXXXXXX" />

        <SmoothScroll>
          <CustomCursor />
          {children}
        </SmoothScroll>

        <ChatWidget />
        <CookieBanner />
      </body>
    </html>
  );
}