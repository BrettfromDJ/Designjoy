import type { WorkItem } from "@/content/site";
import { BudgetCard } from "./BudgetCard";

/** A piece of work built in code, by its id; `large` when shown in the viewer. */
export function CodedWork({ item, large = false }: { item: WorkItem; large?: boolean }) {
  if (item.id === "budget") return <BudgetCard large={large} />;
  return null;
}
