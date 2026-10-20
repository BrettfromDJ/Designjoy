import { Nav } from "@/components/Nav";
import { AskBox } from "@/components/AskBox";
import { ThemePreview } from "@/components/ThemePreview";
import { getFaqs } from "@/lib/faqs";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const { faqs } = await getFaqs();
  return (
    <>
      <Nav />
      {children}
      <AskBox faqs={faqs} />
      <ThemePreview />
    </>
  );
}
