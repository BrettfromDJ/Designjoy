"use client";

import { useState } from "react";
import { LEGAL } from "@/content/legal";
import styles from "./EmailCard.module.css";

/** "Prefer email?": the address, big, to click or copy. */
export function EmailCard() {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(LEGAL.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = `mailto:${LEGAL.email}`;
    }
  }

  return (
    <div className={styles.card}>
      <p className={styles.label}>Prefer email?</p>
      <div className={styles.row}>
        <a href={`mailto:${LEGAL.email}`} className={styles.email}>
          {LEGAL.email}
        </a>
        <button type="button" className={styles.copy} onClick={copy} aria-live="polite">
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
    </div>
  );
}
