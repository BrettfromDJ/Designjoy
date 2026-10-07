import type { ColumnCount, FixedCard, WorkItem } from "@/content/site";

export type Cell =
  | { type: "work"; item: WorkItem }
  | { type: "fixed"; card: FixedCard };

const GAP = 16;
// Reference column width the fixed card heights are measured at.
const REF_WIDTH = 340;
const PRICING_HEIGHT = 580;
// Columns within this many px of each other count as equally short, so
// near-identical tiles fill left to right instead of jumping around.
const TOLERANCE = 12;

function cellHeight(cell: Cell): number {
  if (cell.type === "work") {
    return (REF_WIDTH * cell.item.height) / cell.item.width;
  }
  return cell.card.kind === "pricing" ? PRICING_HEIGHT : cell.card.minHeight;
}

/**
 * Lays out work items as a masonry grid while pinning fixed cards to the
 * slot configured for this column count. Work goes into whichever column is
 * shortest; when that column's next row belongs to a fixed card, the fixed
 * card is placed there instead.
 */
export function layoutMasonry(
  columnCount: ColumnCount,
  work: WorkItem[],
  fixedCards: FixedCard[],
): Cell[][] {
  const columns: Cell[][] = Array.from({ length: columnCount }, () => []);
  const heights = new Array<number>(columnCount).fill(0);

  // Pending fixed cards per column, ordered by row.
  const pending: FixedCard[][] = Array.from({ length: columnCount }, () => []);
  for (const card of fixedCards) {
    const slot = card.slots[columnCount];
    const col =
      slot.column === "last" ? columnCount - 1 : Math.min(slot.column, columnCount - 1);
    pending[col].push(card);
  }
  for (const list of pending) {
    list.sort((a, b) => a.slots[columnCount].row - b.slots[columnCount].row);
  }

  const place = (col: number, cell: Cell) => {
    columns[col].push(cell);
    heights[col] += cellHeight(cell) + GAP;
  };

  let next = 0;
  while (next < work.length) {
    let col = 0;
    for (let i = 1; i < columnCount; i++) {
      if (heights[i] < heights[col] - TOLERANCE) col = i;
    }
    const fixed = pending[col][0];
    if (fixed && fixed.slots[columnCount].row <= columns[col].length) {
      place(col, { type: "fixed", card: pending[col].shift()! });
    } else {
      place(col, { type: "work", item: work[next++] });
    }
  }

  // Fixed cards whose row was never reached go at the end of their column.
  pending.forEach((list, col) => {
    for (const card of list) place(col, { type: "fixed", card });
  });

  return columns;
}
