import { Nav } from "@/components/Nav";
import { AskBox } from "@/components/AskBox";
import { HowItWorksLightbox } from "@/components/HowItWorksCard";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Nav />
      {children}
      <AskBox />
      <HowItWorksLightbox />
    </>
  );
}
