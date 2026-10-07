import { blobConfigured, readLatest, writeLatest } from "./store";

export { blobConfigured };

export type Project = {
  id: string;
  title: string;
  kind: "image" | "video";
  url: string;
  width: number;
  height: number;
};

const PREFIX = "data/projects";

export async function getProjects(): Promise<Project[]> {
  if (!blobConfigured()) return [];
  try {
    const json = await readLatest(PREFIX);
    return json ? (JSON.parse(json) as Project[]) : [];
  } catch (error) {
    console.error("Could not load projects", error);
    return [];
  }
}

export async function saveProjects(projects: Project[]) {
  await writeLatest(PREFIX, "json", JSON.stringify(projects), "application/json");
}

export function isBlobUrl(url: string) {
  try {
    const { protocol, hostname } = new URL(url);
    return protocol === "https:" && hostname.endsWith(".public.blob.vercel-storage.com");
  } catch {
    return false;
  }
}
