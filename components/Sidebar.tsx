"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { fixedCards, type WorkItem } from "@/content/site";
import type { Highlight } from "@/lib/highlight-icons";
import { openAskBox } from "@/lib/ask-box";
import { CallCard } from "./CallCard";
import { HighlightsCard } from "./HighlightsCard";
import { HowItWorksCard } from "./HowItWorksCard";
import { LabsCard } from "./LabsCard";
import { PricingCard } from "./PricingCard";
import { ScopeBoard } from "./ScopeBoard";
import { TestimonialCard } from "./TestimonialCard";
import styles from "./Sidebar.module.css";

/** A fixed card's height from `content/site.ts`, so the cards match the grid's. */
function cardHeight(kind: string, fallback: number) {
  const card = fixedCards.find((c) => c.kind === kind);
  return card && "minHeight" in card ? card.minHeight : fallback;
}

/**
 * Everything that isn't artwork, in one column on the left that scrolls on
 * its own: the homepage cards at full size, pricing first.
 * The artwork scrolls on the right.
 */
export function Sidebar({ work, highlights }: { work: WorkItem[]; highlights: Highlight[] }) {
  const innerRef = useRef<HTMLDivElement>(null);

  // On wider screens the nav sits at the top of the work and the ask box at
  // the bottom (see Nav.module.css and AskBox.module.css).
  useEffect(() => {
    document.body.dataset.sidebar = "";
    return () => {
      delete document.body.dataset.sidebar;
    };
  }, []);

  // Once scrolled, cards fade out as they pass under the nav; while there's
  // more below, the bottom edge fades as a hint. Rechecked as it scrolls and
  // whenever its content resizes.
  useEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    const check = () => {
      el.toggleAttribute("data-scrolled", el.scrollTop > 2);
      el.toggleAttribute("data-more", el.scrollTop + el.clientHeight < el.scrollHeight - 4);
    };
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

  // Entrance: the cards rise in one after another (see Sidebar.module.css).
  // Those on screen at load are staggered; the rest arrive as the column is
  // scrolled to them.
  useEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    const items = Array.from(el.children) as HTMLElement[];
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      items.forEach((item) => item.setAttribute("data-in", ""));
      return;
    }
    let atLoad = true;
    const observer = new IntersectionObserver(
      (entries) => {
        entries
          .filter((entry) => entry.isIntersecting)
          .forEach((entry, i) => {
            const item = entry.target as HTMLElement;
            item.style.setProperty("--d", `${(atLoad ? 260 : 0) + i * (atLoad ? 130 : 90)}ms`);
            item.setAttribute("data-in", "");
            observer.unobserve(item);
          });
        atLoad = false;
      },
      { threshold: 0.08 },
    );
    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);

  return (
    <aside data-hero className={styles.sidebar} aria-label="About Designjoy">
      <div ref={innerRef} className={styles.inner}>
        <h1 className="visually-hidden">Designjoy: design, on subscription</h1>
        <PricingCard />
        {/* For anyone not ready to subscribe: a call, or an email. */}
        <CallCard />
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
