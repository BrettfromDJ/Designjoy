import type { Metadata } from "next";
import { Aurora } from "@/components/directions/Aurora";
import { NavTop } from "@/components/NavTop";
import { getPrototypeData } from "@/components/prototypes/data";
import { Switcher } from "@/components/prototypes/Switcher";

export const metadata: Metadata = { title: "Prototype: Aurora", robots: { index: false } };
export const revalidate = 3600;

export default async function AuroraPrototype() {
  const { work, faqs } = await getPrototypeData();
  return (
    <>
      <NavTop />
      <Aurora work={work} faqs={faqs} />
      <Switcher current="aurora" />
    </>
  );
}
