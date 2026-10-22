import type { Metadata } from "next";
import { Desk } from "@/components/directions/Desk";
import { NavTop } from "@/components/NavTop";
import { getPrototypeData } from "@/components/prototypes/data";
import { Switcher } from "@/components/prototypes/Switcher";

export const metadata: Metadata = { title: "Prototype: Desk", robots: { index: false } };
export const revalidate = 3600;

export default async function DeskPrototype() {
  const { work, faqs } = await getPrototypeData();
  return (
    <>
      <NavTop />
      <Desk work={work} faqs={faqs} />
      <Switcher current="desk" />
    </>
  );
}
