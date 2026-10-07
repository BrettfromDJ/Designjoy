"use client";

import { useState, useSyncExternalStore } from "react";
import { fixedCards, type ColumnCount, type WorkItem } from "@/content/site";
import { layoutMasonry } from "@/lib/masonry";
import { InfoCard } from "./InfoCard";
import { Lightbox } from "./Lightbox";
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

function getColumnCount(): ColumnCount {
  for (const [query, count] of QUERIES) {
    if (window.matchMedia(query).matches) return count;
  }
  return 1;
}

// Info cards with no text yet stay hidden so work fills their slots.
const visibleFixedCards = fixedCards.filter(
  (card) => card.kind !== "info" || Boolean(card.eyebrow || card.title || card.body),
);

function subscribe(onChange: () => void) {
  const lists = QUERIES.map(([query]) => window.matchMedia(query));
  lists.forEach((list) => list.addEventListener("change", onChange));
  return () => lists.forEach((list) => list.removeEventListener("change", onChange));
}

export function MasonryGrid({ work }: { work: WorkItem[] }) {
  const columnCount = useSyncExternalStore(subscribe, getColumnCount, () => 4 as const);
  const columns = layoutMasonry(columnCount, work, visibleFixedCards);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <>
      <div className={styles.grid} style={{ "--columns": columnCount } as React.CSSProperties}>
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
                    onOpen={() => setOpenIndex(work.indexOf(cell.item))}
                  />
                );
              }
              if (cell.card.kind === "testimonial") {
                return <TestimonialCard key={cell.card.id} height={cell.card.minHeight} />;
              }
              if (cell.card.kind === "scope") {
                return <ScopeBoard key={cell.card.id} height={cell.card.minHeight} />;
              }
              if (cell.card.kind === "pricing") {
                return <PricingCard key={cell.card.id} />;
              }
              return <InfoCard key={cell.card.id} card={cell.card} />;
            })}
          </div>
        ))}
      </div>
      {openIndex !== null && work[openIndex] && (
        <Lightbox
          items={work}
          index={openIndex}
          onIndex={setOpenIndex}
          onClose={() => setOpenIndex(null)}
        />
      )}
    </>
  );
}
