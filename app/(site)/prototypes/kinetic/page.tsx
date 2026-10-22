import type { Metadata } from "next";
import { Kinetic } from "@/components/directions/Kinetic";
import { NavTop } from "@/components/NavTop";
import { getPrototypeData } from "@/components/prototypes/data";
import { Switcher } from "@/components/prototypes/Switcher";

export const metadata: Metadata = { title: "Prototype: Kinetic", robots: { index: false } };
export const revalidate = 3600;

export default async function KineticPrototype() {
  const { work, faqs } = await getPrototypeData();
  return (
    <>
      <NavTop />
      <Kinetic work={work} faqs={faqs} />
      <Switcher current="kinetic" />
    </>
  );
}
