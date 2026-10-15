"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { fixedCards, type WorkItem } from "@/content/site";
import type { Highlight } from "@/lib/highlight-icons";
import { openAskBox } from "@/lib/ask-box";
import { HighlightsCard } from "./HighlightsCard";
import { HowItWorksCard } from "./HowItWorksCard";
import { LabsCard } from "./LabsCard";
import { PricingCard } from "./PricingCard";
import { ScopeBoard } from "./ScopeBoard";
import { TestimonialCard } from "./TestimonialCard";
import styles from "./Sidebar.module.css";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/** A fixed card's height from `content/site.ts`, so the cards match the grid's. */
function cardHeight(kind: string, fallback: number) {
  const card = fixedCards.find((c) => c.kind === kind);
  return card && "minHeight" in card ? card.minHeight : fallback;
}

/**
 * Everything that isn't artwork, in one column on the left that scrolls on
 * its own: the headline, then the homepage cards at full size, pricing first.
 * The artwork scrolls on the right.
 */
export function Sidebar({ work, highlights }: { work: WorkItem[]; highlights: Highlight[] }) {
  const innerRef = useRef<HTMLDivElement>(null);
  const [day, setDay] = useState("");
  useEffect(() => setDay(DAYS[new Date(Date.now() + 48 * 3600 * 1000).getDay()]), []);

  // On wider screens this page has no floating nav, and the ask box sits at
  // the bottom of the work instead of the top (see AskBox.module.css).
  useEffect(() => {
    document.body.dataset.sidebar = "";
    return () => {
      delete document.body.dataset.sidebar;
    };
  }, []);

  // While there's more below, the column's bottom edge fades as a hint.
  // Rechecked as it scrolls and whenever its content resizes.
  useEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    const check = () => el.toggleAttribute("data-more", el.scrollTop + el.clientHeight < el.scrollHeight - 4);
    const observer = new ResizeObserver(check);
    observer.observe(el);
    Array.from(el.children).forEach((child) => observer.observe(child));
    el.addEventListener("scroll", check, { passive: true });
    check();
    return () => {
      observer.disconnect();
      el.removeEventListener("scroll", check);
    };
  }, []);

  return (
    <aside data-hero className={styles.sidebar} aria-label="About Designjoy">
      <div ref={innerRef} className={styles.inner}>
        <header className={styles.top}>
          <Link href="/" className={styles.logo} aria-label="Designjoy home">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icons/smile.svg" alt="" width={36} height={36} />
          </Link>
          <span className={styles.status}>
            <span className={styles.liveDot} aria-hidden="true" />
            Spots available
          </span>
        </header>

        <div className={styles.intro}>
          <h1 className={styles.title}>Design, on subscription.</h1>
          <p className={styles.sub}>
            Subscribe today and most requests land {day ? `by ${day}` : "in about two days"}.{" "}
            <span className={styles.muted}>Unlimited requests, $4,995 a month, no contracts.</span>
          </p>
        </div>

        <PricingCard />
        <HowItWorksCard />
        <ScopeBoard height={cardHeight("scope", 429)} />
        <TestimonialCard height={cardHeight("testimonial", 250)} />
        {highlights.length > 0 && <HighlightsCard highlights={highlights} />}
        <LabsCard work={work} />

        <footer className={styles.legal}>
          <span>© {new Date().getFullYear()} Designjoy</span>
          <button type="button" onClick={() => openAskBox("chat")}>
            FAQs
          </button>
          <Link href="/terms">Terms</Link>
          <Link href="/privacy">Privacy</Link>
        </footer>
      </div>
    </aside>
  );
}
