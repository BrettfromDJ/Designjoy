import type { Metadata } from "next";
import { Vault } from "@/components/directions/Vault";
import { NavTop } from "@/components/NavTop";
import { getPrototypeData } from "@/components/prototypes/data";
import { Switcher } from "@/components/prototypes/Switcher";

export const metadata: Metadata = { title: "Prototype: Vault", robots: { index: false } };
export const revalidate = 3600;

export default async function VaultPrototype() {
  const { work, faqs } = await getPrototypeData();
  return (
    <>
      <NavTop />
      <Vault work={work} faqs={faqs} />
      <Switcher current="vault" />
    </>
  );
}
