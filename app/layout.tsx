import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Designjoy",
  description: "One subscription. Endless possibilities.",
};

export const viewport: Viewport = {
  themeColor: "#000000",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
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
