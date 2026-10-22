import type { Metadata } from "next";
import { NavTop } from "@/components/NavTop";
import { getPrototypeData } from "@/components/prototypes/data";
import { Story } from "@/components/prototypes/Story";
import { Switcher } from "@/components/prototypes/Switcher";

export const metadata: Metadata = { title: "Prototype: Story", robots: { index: false } };
export const revalidate = 3600;

export default async function StoryPrototype() {
  const { work, faqs } = await getPrototypeData();
  return (
    <>
      <NavTop />
      <Story work={work} faqs={faqs} />
      <Switcher current="story" />
    </>
  );
}
