"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navLinks } from "@/content/site";
import { openAskBox, type AskBoxView } from "@/lib/ask-box";

// Links that open in the ask box instead of going to a page.
const OPENS_IN_ASK_BOX: Record<string, AskBoxView> = {
  "/faqs": "chat",
  "/pricing": "pricing",
  "/intro-call": "booking",
};
import styles from "./Nav.module.css";

export function Nav() {
  const pathname = usePathname();
  // On the homepage the nav casts its shadow over the grid. On the other
  // pages the shadow is a separate layer beneath the page content, so text
  // scrolling under the nav isn't darkened by it.
  const home = pathname === "/";

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
                    // FAQs, Pricing and Book a call open in the ask box, right where you are
                    // (except on checkout, where the ask box is hidden).
                    OPENS_IN_ASK_BOX[link.href] && pathname !== "/checkout"
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
    </>
  );
}
