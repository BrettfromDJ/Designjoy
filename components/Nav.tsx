"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { introCallHref, navLinks } from "@/content/site";
import { calTrigger } from "@/lib/cal";
import styles from "./Nav.module.css";

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className={styles.nav} aria-label="Main">
      <Link href="/" className={styles.logo} aria-label="Designjoy home">
        <img src="/icons/smile.svg" alt="" width={30} height={30} className={styles.smile} />
      </Link>
      <ul className={styles.links}>
        {navLinks.map((link) => {
          const active = pathname === link.href;
          // "Intro call" opens the booking pop-up instead of navigating.
          if (link.href === introCallHref) {
            return (
              <li key={link.href}>
                <button type="button" className={styles.link} {...calTrigger}>
                  {link.label}
                </button>
              </li>
            );
          }
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                className={active ? `${styles.link} ${styles.active}` : styles.link}
                aria-current={active ? "page" : undefined}
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
