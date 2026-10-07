import { del, list, put } from "@vercel/blob";

// Small documents (the project list, the chatbot knowledge base) live in
// Blob storage. Each save writes a new file, so no CDN copy is ever stale,
// then removes the older versions.

export function blobConfigured() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

async function versions(prefix: string) {
  const { blobs } = await list({ prefix });
  return blobs.sort((a, b) => +new Date(b.uploadedAt) - +new Date(a.uploadedAt));
}

/** The latest saved text under `prefix`, or null if nothing has been saved. */
export async function readLatest(prefix: string): Promise<string | null> {
  const [latest] = await versions(prefix);
  if (!latest) return null;
  const res = await fetch(latest.url);
  if (!res.ok) throw new Error(`Fetching ${latest.pathname} failed: ${res.status}`);
  return res.text();
}

export async function writeLatest(prefix: string, extension: string, body: string, contentType: string) {
  const previous = await versions(prefix);
  await put(`${prefix}.${extension}`, body, { access: "public", addRandomSuffix: true, contentType });
  if (previous.length) await del(previous.map((b) => b.url));
}
