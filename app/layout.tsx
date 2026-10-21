import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Designjoy",
  description: "One subscription. Endless possibilities.",
};

export const viewport: Viewport = {
  themeColor: "#f2f2f0",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500&family=Roboto+Mono&family=Instrument+Serif:ital@0;1&family=Space+Grotesk:wght@700&family=Syne:wght@800&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
