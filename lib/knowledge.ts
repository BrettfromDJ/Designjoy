import { readFile } from "node:fs/promises";
import path from "node:path";
import { blobConfigured, readLatest, writeLatest } from "./store";

const PREFIX = "data/knowledge-base";
export const MAX_KNOWLEDGE_LENGTH = 200_000;

/** The repo's copy, used until a version is saved from /admin. */
export function defaultKnowledge() {
  return readFile(path.join(process.cwd(), "content", "knowledge-base.md"), "utf8");
}

export async function getKnowledge(): Promise<{ text: string; source: "saved" | "default" }> {
  if (blobConfigured()) {
    try {
      const saved = await readLatest(PREFIX);
      if (saved !== null) return { text: saved, source: "saved" };
    } catch (error) {
      console.error("Could not load saved knowledge base", error);
    }
  }
  return { text: await defaultKnowledge(), source: "default" };
}

export async function saveKnowledge(text: string) {
  await writeLatest(PREFIX, "md", text, "text/markdown; charset=utf-8");
  cached = null;
}

// The chat route reuses the knowledge base for a minute rather than
// reading storage on every message.
let cached: { text: string; at: number } | null = null;
const TTL = 60_000;

export async function getKnowledgeForChat() {
  if (cached && Date.now() - cached.at < TTL) return cached.text;
  const { text } = await getKnowledge();
  cached = { text, at: Date.now() };
  return text;
}

const ADDED_HEADING = "## Answers added from visitor questions";

/** Adds an approved answer to the knowledge base, under its own heading. */
export async function addToKnowledge(question: string, answer: string) {
  const { text } = await getKnowledge();
  const entry = `**Q: ${question.trim()}**\nA: ${answer.trim()}`;
  const next = text.includes(ADDED_HEADING)
    ? `${text.trimEnd()}\n\n${entry}\n`
    : `${text.trimEnd()}\n\n${ADDED_HEADING}\n\n${entry}\n`;
  if (next.length > MAX_KNOWLEDGE_LENGTH) throw new Error("The knowledge base is full.");
  await saveKnowledge(next);
}
