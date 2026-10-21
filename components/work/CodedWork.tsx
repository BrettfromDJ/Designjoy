import type { WorkItem } from "@/content/site";
import { FinanceReel } from "./FinanceReel";

/** A piece of work built in code, by its id; `large` when shown in the viewer. */
export function CodedWork({ item, large = false }: { item: WorkItem; large?: boolean }) {
  if (item.id === "finance") return <FinanceReel large={large} />;
  return null;
}
