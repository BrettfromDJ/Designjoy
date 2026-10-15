import { MasonryGrid } from "@/components/MasonryGrid";
import { Sidebar } from "@/components/Sidebar";
import { sampleWork, type WorkItem } from "@/content/site";
import { getHighlights } from "@/lib/highlights";
import { getProjects } from "@/lib/projects";

// The homepage: everything that isn't artwork in a fixed sidebar on the left,
// the work scrolling on the right. The previous layout lives at /classic.

// Rebuilt whenever projects change in /admin; this is a fallback refresh.
export const revalidate = 3600;

export default async function Home() {
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
      <Sidebar work={work} highlights={highlights} />
      <MasonryGrid work={work} highlights={highlights} workOnly />
    </main>
  );
}
