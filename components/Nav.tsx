"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { navLinks } from "@/content/site";
import { openAskBox, type AskBoxView } from "@/lib/ask-box";

// Links that open in the ask box instead of going to a page.
const OPENS_IN_ASK_BOX: Record<string, AskBoxView> = {
  "/faqs": "chat",
  "/pricing": "pricing",
  "/intro-call": "booking",
};
import styles from "./Nav.module.css";

/*
 * Nav treatments for the sidebar homepage, previewed with ?nav=1…7 and a
 * small switcher. Without ?nav it's the floating pill (option 1).
 */
const NAV_OPTIONS = [
  "Floating pill",
  "Full-width bar",
  "Pills",
  "Split: logo left, links right",
  "In the sidebar",
  "At the bottom, beside the ask box",
  "Plain text links",
] as const;

function useNavOption() {
  const [n, setN] = useState(0);
  useEffect(() => {
    const v = Number(new URLSearchParams(window.location.search).get("nav"));
    if (v >= 1 && v <= NAV_OPTIONS.length) setN(v);
  }, []);
  // The look is set on <body> so the sidebar, grid and ask box can make room.
  useEffect(() => {
    if (n) document.body.dataset.nav = String(n);
    return () => {
      delete document.body.dataset.nav;
    };
  }, [n]);
  const go = (to: number) => {
    const next = ((to - 1 + NAV_OPTIONS.length) % NAV_OPTIONS.length) + 1;
    const url = new URL(window.location.href);
    url.searchParams.set("nav", String(next));
    window.history.replaceState(null, "", url);
    setN(next);
  };
  return [n, go] as const;
}

export function Nav() {
  const [option, go] = useNavOption();
  const pathname = usePathname();
  // On the homepage the nav casts its shadow over the grid. On the other
  // pages the shadow is a separate layer beneath the page content, so text
  // scrolling under the nav isn't darkened by it.
  const home = pathname === "/" || pathname === "/classic";

  return (
    <>
      {!home && <div className={styles.shadow} aria-hidden="true" />}
      <nav
        className={home ? styles.nav : `${styles.nav} ${styles.flat}`}
        aria-label="Main"
      >
        <Link href="/" className={styles.logo} aria-label="Designjoy home">
          <img
            src="/icons/smile.svg"
            alt=""
            width={36}
            height={36}
            className={styles.smile}
          />
        </Link>
        <ul className={styles.links}>
          {navLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={[
                    styles.link,
                    active && styles.active,
                    "cta" in link && link.cta && styles.cta,
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  aria-current={active ? "page" : undefined}
                  onClick={
                    // FAQs, Pricing and Book a call open in the ask box, right where you are.
                    OPENS_IN_ASK_BOX[link.href]
                      ? (e) => {
                          e.preventDefault();
                          openAskBox(OPENS_IN_ASK_BOX[link.href]);
                        }
                      : undefined
                  }
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      {option > 0 && (
        <div className={styles.switcher} role="group" aria-label="Nav preview">
          <button type="button" onClick={() => go(option - 1)} aria-label="Previous nav">
            ‹
          </button>
          <span>
            <b>{option}</b>/{NAV_OPTIONS.length} · {NAV_OPTIONS[option - 1]}
          </span>
          <button type="button" onClick={() => go(option + 1)} aria-label="Next nav">
            ›
          </button>
        </div>
      )}
    </>
  );
}
