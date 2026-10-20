"use client";

import { useEffect, useState } from "react";
import styles from "./ThemePreview.module.css";

/**
 * Preview-only: with ?theme in the address, a small switch flips the site
 * between dark and light. Without it, nothing shows and the site stays dark.
 */
export function ThemePreview() {
  const [theme, setTheme] = useState<"dark" | "light" | null>(null);

  useEffect(() => {
    const param = new URLSearchParams(window.location.search).get("theme");
    if (param) setTheme(param === "light" ? "light" : "dark");
  }, []);

  if (!theme) return null;

  const pick = (next: "dark" | "light") => {
    setTheme(next);
    if (next === "light") document.documentElement.dataset.theme = "light";
    else delete document.documentElement.dataset.theme;
    const url = new URL(window.location.href);
    url.searchParams.set("theme", next);
    window.history.replaceState(null, "", url);
  };

  return (
    <div className={styles.switch} role="group" aria-label="Theme preview">
      {(["dark", "light"] as const).map((t) => (
        <button key={t} type="button" aria-pressed={theme === t} onClick={() => pick(t)}>
          {t === "dark" ? "Dark" : "Light"}
        </button>
      ))}
    </div>
  );
}
