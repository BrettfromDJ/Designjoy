import type { Metadata } from "next";
import { NavTop } from "@/components/NavTop";
import { Chapters } from "@/components/prototypes/Chapters";
import { getPrototypeData } from "@/components/prototypes/data";
import { Switcher } from "@/components/prototypes/Switcher";

export const metadata: Metadata = { title: "Prototype: Chapters", robots: { index: false } };
export const revalidate = 3600;

export default async function ChaptersPrototype() {
  const { work, faqs } = await getPrototypeData();
  return (
    <>
      <NavTop />
      <Chapters work={work} faqs={faqs} />
      <Switcher current="chapters" />
    </>
  );
}
