import { HeroAsk } from "@/components/HeroAsk";
import { MasonryGrid } from "@/components/MasonryGrid";
import { sampleWork, type WorkItem } from "@/content/site";
import { getHighlights } from "@/lib/highlights";
import { getProjects } from "@/lib/projects";
import Link from "next/link";
import type { Metadata } from "next";
import styles from "../page.module.css";

// The previous homepage (hero above the grid, tiles in the grid), kept at
// /classic to compare against or switch back to. Not indexed by search engines.
export const metadata: Metadata = { robots: { index: false } };

// Rebuilt whenever projects change in /admin; this is a fallback refresh.
export const revalidate = 3600;

export default async function ClassicHome() {
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
    <main>
      <HeroAsk
        art={work
          .filter((w) => w.kind === "image")
          .map(({ src, width, height }) => ({ src, width, height }))}
      />
      <MasonryGrid work={work} highlights={highlights} />
      <footer className={styles.footer}>
        <span>© {new Date().getFullYear()} Designjoy</span>
        <Link href="/terms">Terms</Link>
        <Link href="/privacy">Privacy</Link>
      </footer>
    </main>
  );
}
