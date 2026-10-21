import { MasonryGrid } from "@/components/MasonryGrid";
import { Sidebar } from "@/components/Sidebar";
import { codedWork, sampleWork, type WorkItem } from "@/content/site";
import { getHighlights } from "@/lib/highlights";
import { getProjects } from "@/lib/projects";

// The homepage: everything that isn't artwork in a fixed sidebar on the left,
// the work scrolling on the right. The previous layout lives at /classic.

// Rebuilt whenever projects change in /admin; this is a fallback refresh.
export const revalidate = 3600;

export default async function Home() {
  const [projects, highlights] = await Promise.all([getProjects(), getHighlights()]);
  const uploaded: WorkItem[] = projects.length
    ? projects.map(({ id, title, company, kind, url, width, height, frames }) => ({
        id,
        title,
        company,
        kind,
        src: url,
        width,
        height,
        ...(kind === "image" && frames?.length ? { frames } : {}),
      }))
    : sampleWork;
  // The coded pieces come first.
  const work = [...codedWork, ...uploaded];

  return (
    <main style={{ "--sidebar": "356px" } as React.CSSProperties}>
      {/* Marks the page before it first paints, so the nav and ask box start
          in their sidebar-layout spots instead of jumping there on load. */}
      <script dangerouslySetInnerHTML={{ __html: 'document.body.dataset.sidebar=""' }} />
      <Sidebar work={work} highlights={highlights} />
      <MasonryGrid work={work} highlights={highlights} workOnly />
    </main>
  );
}
