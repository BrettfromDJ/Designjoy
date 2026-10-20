"use client";

import { useEffect, useState } from "react";
import styles from "./ThemePreview.module.css";

/**
 * Preview-only: once ?theme is in the address (remembered for the visit), a
 * small switch flips the site between dark and light. Without it, nothing
 * shows and the site stays dark.
 */
export function ThemePreview() {
  const [theme, setTheme] = useState<"dark" | "light" | null>(null);

  useEffect(() => {
    let param = new URLSearchParams(window.location.search).get("theme");
    try {
      param ??= sessionStorage.getItem("theme");
    } catch {}
    if (param) setTheme(param === "light" ? "light" : "dark");
  }, []);

  if (!theme) return null;

  const pick = (next: "dark" | "light") => {
    setTheme(next);
    if (next === "light") document.documentElement.dataset.theme = "light";
    else delete document.documentElement.dataset.theme;
    try {
      sessionStorage.setItem("theme", next);
    } catch {}
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
