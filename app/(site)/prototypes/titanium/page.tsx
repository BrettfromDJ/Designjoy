import type { Metadata } from "next";
import { Lux } from "@/components/directions/Lux";
import { NavTop } from "@/components/NavTop";
import { getPrototypeData } from "@/components/prototypes/data";
import { Switcher } from "@/components/prototypes/Switcher";

export const metadata: Metadata = { title: "Prototype: Vault, Titanium", robots: { index: false } };
export const revalidate = 3600;

export default async function Page() {
  const { work, faqs } = await getPrototypeData();
  return (
    <>
      <NavTop />
      <Lux work={work} faqs={faqs} look="titanium" />
      <Switcher current="titanium" />
    </>
  );
}
