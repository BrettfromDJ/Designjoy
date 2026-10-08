"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navLinks } from "@/content/site";
import { OPEN_FAQ_EVENT } from "./AskBox";
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
                  className={
                    active ? `${styles.link} ${styles.active}` : styles.link
                  }
                  aria-current={active ? "page" : undefined}
                  onClick={
                    // FAQs open in the ask box, right where you are (except on
                    // checkout, where the ask box is hidden).
                    link.href === "/faqs" && pathname !== "/checkout"
                      ? (e) => {
                          e.preventDefault();
                          window.dispatchEvent(new Event(OPEN_FAQ_EVENT));
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
