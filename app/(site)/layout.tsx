import { Nav } from "@/components/Nav";
import { AskBox } from "@/components/AskBox";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Nav />
      {children}
      <AskBox />
    </>
  );
}
