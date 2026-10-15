import type { Metadata } from "next";
import { MasonryGrid } from "@/components/MasonryGrid";
import { Sidebar } from "@/components/Sidebar";
import { sampleWork, type WorkItem } from "@/content/site";
import { getHighlights } from "@/lib/highlights";
import { getProjects } from "@/lib/projects";

// A preview of the homepage laid out with a fixed sidebar, at /sidebar.
export const metadata: Metadata = { robots: { index: false } };
export const revalidate = 3600;

export default async function SidebarPreview() {
  const [projects, highlights] = await Promise.all([getProjects(), getHighlights()]);
  const work: WorkItem[] = projects.length
    ? projects.map(({ id, title, kind, url, width, height, frames, framed }) => ({
        id,
        title,
        kind,
        src: url,
        width,
        height,
        ...(kind === "image" && frames?.length ? { frames } : {}),
        ...(framed ? { framed } : {}),
      }))
    : sampleWork;

  return (
    <main style={{ "--sidebar": "356px" } as React.CSSProperties}>
      <Sidebar work={work} />
      <MasonryGrid work={work} highlights={highlights} workOnly />
    </main>
  );
}
