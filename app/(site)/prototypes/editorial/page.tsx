import type { Metadata } from "next";
import { Editorial } from "@/components/directions/Editorial";
import { NavTop } from "@/components/NavTop";
import { getPrototypeData } from "@/components/prototypes/data";
import { Switcher } from "@/components/prototypes/Switcher";

export const metadata: Metadata = { title: "Prototype: Editorial", robots: { index: false } };
export const revalidate = 3600;

export default async function EditorialPrototype() {
  const { work, faqs } = await getPrototypeData();
  return (
    <>
      <NavTop />
      <Editorial work={work} faqs={faqs} />
      <Switcher current="editorial" />
    </>
  );
}
