"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { fixedCards, type ColumnCount, type WorkItem } from "@/content/site";
import type { Highlight } from "@/lib/highlight-icons";
import { layoutMasonry } from "@/lib/masonry";
import { HighlightsCard } from "./HighlightsCard";
import { HowItWorksCard } from "./HowItWorksCard";
import { InfoCard } from "./InfoCard";
import { LabsCard } from "./LabsCard";
import { LIGHTBOX_VARIANTS, Lightbox } from "./Lightbox";
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

// With the sidebar, the work has a column's less room.
const SIDEBAR_QUERIES: [string, ColumnCount][] = [
  ["(min-width: 1800px)", 4],
  ["(min-width: 1360px)", 3],
  ["(min-width: 560px)", 2],
];

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

/*
 * Ways to open a piece of work other than the dimmed lightbox, previewed
 * with ?view=1…4 and a small switcher. Without ?view it opens as now.
 */
function useView() {
  const [n, setN] = useState(0);
  useEffect(() => {
    const v = Number(new URLSearchParams(window.location.search).get("view"));
    if (v >= 1 && v <= LIGHTBOX_VARIANTS.length) setN(v);
  }, []);
  const go = (to: number) => {
    const count = LIGHTBOX_VARIANTS.length;
    const next = ((to - 1 + count) % count) + 1;
    const url = new URL(window.location.href);
    url.searchParams.set("view", String(next));
    window.history.replaceState(null, "", url);
    setN(next);
  };
  return [n, go] as const;
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
    () => (workOnly ? 3 : 4) as ColumnCount,
  );
  const columns = layoutMasonry(columnCount, work, workOnly ? [] : visibleFixedCards(highlights));
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [view, goView] = useView();

  return (
    <>
      <div className={workOnly ? `${styles.grid} ${styles.beside}` : styles.grid} style={{ "--columns": columnCount } as React.CSSProperties}>
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
      {openIndex !== null && work[openIndex] && (
        <Lightbox
          items={work}
          index={openIndex}
          onIndex={setOpenIndex}
          onClose={() => setOpenIndex(null)}
          variant={view}
        />
      )}
      {view > 0 &&
        createPortal(
          <div className={styles.switcher} role="group" aria-label="Photo viewer preview">
            <button type="button" onClick={() => goView(view - 1)} aria-label="Previous">
              ‹
            </button>
            <span>
              <b>{view}</b>/{LIGHTBOX_VARIANTS.length} · {LIGHTBOX_VARIANTS[view - 1]}
            </span>
            <button type="button" onClick={() => goView(view + 1)} aria-label="Next">
              ›
            </button>
          </div>,
          document.body,
        )}
    </>
  );
}
