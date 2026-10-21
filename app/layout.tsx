import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Inter, Roboto_Mono, Space_Grotesk, Syne } from "next/font/google";
import "./globals.css";

export const metadata: Metadata = {
  title: "Designjoy",
  description: "One subscription. Endless possibilities.",
};

export const viewport: Viewport = {
  themeColor: "#f2f2f0",
};

// Served from the site itself rather than Google's servers, so nothing has to
// be fetched from elsewhere before the page can show. Each is exposed as a
// CSS variable (used in globals.css and the components). Only the two the
// first screen uses are preloaded.
const inter = Inter({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-inter" });
const robotoMono = Roboto_Mono({ subsets: ["latin"], weight: "400", variable: "--font-roboto-mono" });
const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
  preload: false,
});
// Only for logos in the "trusted by" strip.
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], weight: "700", variable: "--font-space-grotesk", preload: false });
const syne = Syne({ subsets: ["latin"], weight: "800", variable: "--font-syne", preload: false });
const fonts = [inter, robotoMono, instrumentSerif, spaceGrotesk, syne].map((font) => font.variable).join(" ");

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={fonts} suppressHydrationWarning>
      <head>
        {/* Light by default; dark if chosen with the toggle in the nav (or
            ?theme=dark), remembered on this device. The admin and the
            welcome page, with its lanyard, are always dark. Set before the
            page paints so it never flashes the wrong theme. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              'var t="light";try{var q=new URLSearchParams(location.search).get("theme");if(q)localStorage.setItem("theme",q);t=q||localStorage.getItem("theme")||"light"}catch(e){}var p=location.pathname;if(t!=="dark"&&!p.startsWith("/admin")&&!p.startsWith("/welcome"))document.documentElement.dataset.theme="light"',
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
