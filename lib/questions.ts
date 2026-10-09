import { del, list, put } from "@vercel/blob";
import { blobConfigured } from "./store";

// Every question asked in the ask box, for /admin/questions. Each one is its
// own small file, so logging never has to read or rewrite anything.

const PREFIX = "logs/questions/";

export type LoggedQuestion = {
  question: string;
  answer: string;
  /** Typed into the box, or a tapped FAQ chip. */
  source: "typed" | "faq";
  /** The page it was asked on, e.g. "/" or "/labs". */
  page: string;
  /** ISO timestamp. */
  at: string;
  /** The chatbot couldn't answer it from the knowledge base. */
  flagged?: boolean;
  /** A drafted answer for the owner to check, for flagged questions. */
  suggestion?: string;
  /** What the owner did with a flagged question. */
  resolved?: "added" | "dismissed";
};

/** A logged question, with the address of the file it's stored in. */
export type StoredQuestion = LoggedQuestion & { url: string };

/** The path part of a Referer header, or "/" if there isn't one. */
export function pageFrom(request: Request) {
  try {
    return new URL(request.headers.get("referer") ?? "").pathname || "/";
  } catch {
    return "/";
  }
}

function write(entry: LoggedQuestion) {
  return put(`${PREFIX}${entry.at.replace(/[:.]/g, "-")}.json`, JSON.stringify(entry), {
    access: "public",
    addRandomSuffix: true,
    contentType: "application/json",
  });
}

export async function logQuestion(entry: Omit<LoggedQuestion, "at">) {
  if (!blobConfigured()) return;
  try {
    await write({
      ...entry,
      question: entry.question.slice(0, 2000),
      answer: entry.answer.slice(0, 4000),
      at: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Could not log question", error);
  }
}

/** Marks a flagged question as handled: rewrites its file, keeping its date. */
export async function resolveQuestion(url: string, resolved: "added" | "dismissed") {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("Question not found.");
  const entry = (await res.json()) as LoggedQuestion;
  await write({ ...entry, resolved });
  await del(url);
}

async function allBlobs() {
  const blobs: { url: string; uploadedAt: Date }[] = [];
  let cursor: string | undefined;
  do {
    const page = await list({ prefix: PREFIX, cursor, limit: 1000 });
    blobs.push(...page.blobs);
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor && blobs.length < 5000);
  return blobs;
}

/** The latest questions, newest first, plus how many there are in total. */
export async function getQuestions(limit = 300): Promise<{ questions: StoredQuestion[]; total: number }> {
  if (!blobConfigured()) return { questions: [], total: 0 };
  const blobs = (await allBlobs()).sort((a, b) => +new Date(b.uploadedAt) - +new Date(a.uploadedAt));
  const latest = blobs.slice(0, limit);
  const questions: StoredQuestion[] = [];
  // Fetch in small batches so a long log doesn't open hundreds of requests at once.
  for (let i = 0; i < latest.length; i += 25) {
    const batch = await Promise.all(
      latest.slice(i, i + 25).map((b) =>
        fetch(b.url, { cache: "no-store" })
          .then((r) => (r.ok ? (r.json() as Promise<LoggedQuestion>) : null))
          .then((q) => (q ? { ...q, url: b.url } : null))
          .catch(() => null),
      ),
    );
    questions.push(...batch.filter((q): q is StoredQuestion => q !== null));
  }
  return { questions, total: blobs.length };
}

export async function clearQuestions() {
  const blobs = await allBlobs();
  for (let i = 0; i < blobs.length; i += 500) await del(blobs.slice(i, i + 500).map((b) => b.url));
}
