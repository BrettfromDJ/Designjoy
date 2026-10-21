import type { WorkItem } from "@/content/site";
import { FinanceReel } from "./FinanceReel";
import { QuoteableReel } from "./QuoteableReel";
import { RecapsReel } from "./RecapsReel";

/** A piece of work built in code, by its id; `large` when shown in the viewer. */
export function CodedWork({ item, large = false }: { item: WorkItem; large?: boolean }) {
  if (item.id === "finance") return <FinanceReel large={large} />;
  if (item.id === "recaps") return <RecapsReel large={large} />;
  if (item.id === "quoteable") return <QuoteableReel />;
  return null;
}
