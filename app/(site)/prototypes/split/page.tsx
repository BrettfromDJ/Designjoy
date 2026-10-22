import type { Metadata } from "next";
import { MasonryGrid } from "@/components/MasonryGrid";
import { getPrototypeData } from "@/components/prototypes/data";
import { SplitSidebar } from "@/components/prototypes/SplitSidebar";
import { Switcher } from "@/components/prototypes/Switcher";

export const metadata: Metadata = { title: "Prototype: Split", robots: { index: false } };
export const revalidate = 3600;

export default async function SplitPrototype() {
  const { work, faqs } = await getPrototypeData();
  return (
    <main style={{ "--sidebar": "356px" } as React.CSSProperties}>
      <script dangerouslySetInnerHTML={{ __html: 'document.body.dataset.sidebar=""' }} />
      <SplitSidebar faqs={faqs} />
      <MasonryGrid work={work} highlights={[]} workOnly />
      <Switcher current="split" />
    </main>
  );
}
