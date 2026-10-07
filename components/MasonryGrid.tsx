"use client";

import { useSyncExternalStore } from "react";
import { fixedCards, type ColumnCount, type WorkItem } from "@/content/site";
import { layoutMasonry } from "@/lib/masonry";
import { InfoCard } from "./InfoCard";
import { PricingCard } from "./PricingCard";
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
  (card) => card.kind === "pricing" || card.eyebrow || card.title || card.body,
);

function subscribe(onChange: () => void) {
  const lists = QUERIES.map(([query]) => window.matchMedia(query));
  lists.forEach((list) => list.addEventListener("change", onChange));
  return () => lists.forEach((list) => list.removeEventListener("change", onChange));
}

export function MasonryGrid({ work }: { work: WorkItem[] }) {
  const columnCount = useSyncExternalStore(subscribe, getColumnCount, () => 4 as const);
  const columns = layoutMasonry(columnCount, work, visibleFixedCards);

  return (
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
                />
              );
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
