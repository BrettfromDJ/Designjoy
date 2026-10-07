import { MasonryGrid } from "@/components/MasonryGrid";
import { sampleWork, type WorkItem } from "@/content/site";
import { getProjects } from "@/lib/projects";

// Rebuilt whenever projects change in /admin; this is a fallback refresh.
export const revalidate = 3600;

export default async function Home() {
  const projects = await getProjects();
  const work: WorkItem[] = projects.length
    ? projects.map(({ id, title, kind, url, width, height }) => ({ id, title, kind, src: url, width, height }))
    : sampleWork;

  return (
    <main>
      <h1 className="visually-hidden">Designjoy</h1>
      <MasonryGrid work={work} />
    </main>
  );
}
