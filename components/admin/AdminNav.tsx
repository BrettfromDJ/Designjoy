"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/admin/actions";
import styles from "./Admin.module.css";

const tabs = [
  { href: "/admin", label: "Projects" },
  { href: "/admin/highlights", label: "Highlights" },
  { href: "/admin/knowledge", label: "Chatbot" },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className={styles.nav} aria-label="Admin">
      <ul className={styles.tabs}>
        {tabs.map((tab) => (
          <li key={tab.href}>
            <Link
              href={tab.href}
              className={styles.tab}
              aria-current={pathname === tab.href ? "page" : undefined}
            >
              {tab.label}
            </Link>
          </li>
        ))}
      </ul>
      <div className={styles.headerActions}>
        <Link href="/" className={styles.secondary}>
          View site
        </Link>
        <form action={logout}>
          <button type="submit" className={styles.secondary}>
            Sign out
          </button>
        </form>
      </div>
    </nav>
  );
}
