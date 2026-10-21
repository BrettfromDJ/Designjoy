"use client";

import { useSyncExternalStore } from "react";
import { fixedCards, type ColumnCount, type WorkItem } from "@/content/site";
import type { Highlight } from "@/lib/highlight-icons";
import { layoutMasonry } from "@/lib/masonry";
import { HighlightsCard } from "./HighlightsCard";
import { HowItWorksCard } from "./HowItWorksCard";
import { InfoCard } from "./InfoCard";
import { LabsCard } from "./LabsCard";
import { PricingCard } from "./PricingCard";
import { ScopeBoard } from "./ScopeBoard";
import { TestimonialCard } from "./TestimonialCard";
import { WorkCard } from "./WorkCard";
import styles from "./MasonryGrid.module.css";

// Keep in sync with the breakpoints in MasonryGrid.module.css.
const QUERIES: [string, ColumnCount][] = [
  ["(min-width: 1100px)", 4],
  ["(min-width: 820px)", 3],
  ["(min-width: 560px)", 2],
];

// Beside the sidebar the work is shown big: one piece across on laptops,
// more as the screen grows, so no piece ever gets stretched too wide.
const SIDEBAR_QUERIES: [string, ColumnCount][] = [
  ["(min-width: 2400px)", 3],
  ["(min-width: 1600px)", 2],
];
// Image sizes to match those columns (the sidebar takes ~372px).
const SIDEBAR_SIZES = "(min-width: 2400px) 30vw, (min-width: 1600px) 40vw, (min-width: 820px) 75vw, 100vw";

function getColumnCount(queries = QUERIES): ColumnCount {
  for (const [query, count] of queries) {
    if (window.matchMedia(query).matches) return count;
  }
  return 1;
}

// Info cards with no text yet, and Highlights with no awards yet, stay
// hidden so work fills their slots.
function visibleFixedCards(highlights: Highlight[]) {
  return fixedCards.filter((card) =>
    card.kind === "info"
      ? Boolean(card.eyebrow || card.title || card.body)
      : card.kind === "highlights"
        ? highlights.length > 0
        : true,
  );
}

function subscribe(onChange: () => void) {
  const lists = [...QUERIES, ...SIDEBAR_QUERIES].map(([query]) => window.matchMedia(query));
  lists.forEach((list) => list.addEventListener("change", onChange));
  return () => lists.forEach((list) => list.removeEventListener("change", onChange));
}

/** `workOnly` leaves out the fixed cards, for the sidebar layout where they live on the left. */
export function MasonryGrid({
  work,
  highlights,
  workOnly = false,
}: {
  work: WorkItem[];
  highlights: Highlight[];
  workOnly?: boolean;
}) {
  const columnCount = useSyncExternalStore(
    subscribe,
    () => getColumnCount(workOnly ? SIDEBAR_QUERIES : QUERIES),
    () => (workOnly ? 1 : 4) as ColumnCount,
  );
  const columns = layoutMasonry(columnCount, work, workOnly ? [] : visibleFixedCards(highlights));

  return (
    <div
      className={workOnly ? `${styles.grid} ${styles.beside}` : styles.grid}
      data-single={(workOnly && columnCount === 1) || undefined}
      style={{ "--columns": columnCount } as React.CSSProperties}
    >
      {columns.map((column, i) => (
        <div key={i} className={styles.column}>
          {column.map((cell, row) => {
            if (cell.type === "work") {
              return (
                <WorkCard
                  key={cell.item.id}
                  item={cell.item}
                  priority={i < 3}
                  order={row * columns.length + i}
                  sizes={workOnly ? SIDEBAR_SIZES : undefined}
                />
              );
            }
            if (cell.card.kind === "testimonial") {
              return <TestimonialCard key={cell.card.id} height={cell.card.minHeight} />;
            }
            if (cell.card.kind === "scope") {
              return <ScopeBoard key={cell.card.id} height={cell.card.minHeight} />;
            }
            if (cell.card.kind === "highlights") {
              return <HighlightsCard key={cell.card.id} highlights={highlights} />;
            }
            if (cell.card.kind === "howItWorks") {
              return <HowItWorksCard key={cell.card.id} />;
            }
            if (cell.card.kind === "labs") {
              return <LabsCard key={cell.card.id} work={work} />;
            }
            if (cell.card.kind === "pricing") {
              return <PricingCard key={cell.card.id} />;
            }
            return <InfoCard key={cell.card.id} card={cell.card} />;
          })}
        </div>
      ))}
    </div>
  );
}
