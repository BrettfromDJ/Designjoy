"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navLinks } from "@/content/site";
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
