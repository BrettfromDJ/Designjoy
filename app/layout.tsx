import type { Metadata, Viewport } from "next";
import "./globals.css";
import { INTRO_SEEN_KEY } from "@/lib/intro";

export const metadata: Metadata = {
  title: "Designjoy",
  description: "One subscription. Endless possibilities.",
};

export const viewport: Viewport = {
  themeColor: "#000000",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Runs before the page paints, so a repeat visit never flashes the intro. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(sessionStorage.getItem("${INTRO_SEEN_KEY}")==="1"||matchMedia("(prefers-reduced-motion: reduce)").matches)document.documentElement.dataset.introSeen=""}catch(e){}`,
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Roboto+Mono&family=Instrument+Serif:ital@0;1&family=Space+Grotesk:wght@700&family=Syne:wght@800&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
