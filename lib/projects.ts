import { del, list, put } from "@vercel/blob";

export type Project = {
  id: string;
  title: string;
  kind: "image" | "video";
  url: string;
  width: number;
  height: number;
};

// The project list is a JSON file in Blob storage. Each save writes a new
// file (so no CDN copy is ever stale) and removes the older ones.
const MANIFEST_PREFIX = "data/projects";

export function blobConfigured() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

async function manifestBlobs() {
  const { blobs } = await list({ prefix: MANIFEST_PREFIX });
  return blobs.sort((a, b) => +new Date(b.uploadedAt) - +new Date(a.uploadedAt));
}

export async function getProjects(): Promise<Project[]> {
  if (!blobConfigured()) return [];
  try {
    const [latest] = await manifestBlobs();
    if (!latest) return [];
    const res = await fetch(latest.url);
    if (!res.ok) throw new Error(`Manifest fetch failed: ${res.status}`);
    return (await res.json()) as Project[];
  } catch (error) {
    console.error("Could not load projects", error);
    return [];
  }
}

export async function saveProjects(projects: Project[]) {
  const previous = await manifestBlobs();
  await put(`${MANIFEST_PREFIX}.json`, JSON.stringify(projects), {
    access: "public",
    addRandomSuffix: true,
    contentType: "application/json",
  });
  if (previous.length) await del(previous.map((b) => b.url));
}

export function isBlobUrl(url: string) {
  try {
    const { protocol, hostname } = new URL(url);
    return protocol === "https:" && hostname.endsWith(".public.blob.vercel-storage.com");
  } catch {
    return false;
  }
}
