import type { WorkItem } from "@/content/site";
import { AltosReel } from "./AltosReel";
import { FinanceReel } from "./FinanceReel";
import { OffCanvasReel } from "./OffCanvasReel";
import { OrdinReel } from "./OrdinReel";
import { RecapsReel } from "./RecapsReel";

/** A piece of work built in code, by its id; `large` when shown in the viewer. */
export function CodedWork({ item, large = false }: { item: WorkItem; large?: boolean }) {
  if (item.id === "finance") return <FinanceReel large={large} />;
  if (item.id === "recaps") return <RecapsReel large={large} />;
  if (item.id === "altos") return <AltosReel />;
  if (item.id === "ordin") return <OrdinReel />;
  if (item.id === "offcanvas") return <OffCanvasReel />;
  return null;
}
