"use server";

import { del } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isAdmin, signIn, signOut } from "@/lib/auth";
import { MAX_KNOWLEDGE_LENGTH, addToKnowledge, saveKnowledge } from "@/lib/knowledge";
import { HIGHLIGHT_ICON_NAMES, MAX_HIGHLIGHTS, type Highlight } from "@/lib/highlight-icons";
import { getHighlights, saveHighlights } from "@/lib/highlights";
import { getProjects, isBlobUrl, saveProjects, type Project } from "@/lib/projects";
import { clearQuestions, resolveQuestion } from "@/lib/questions";

async function requireAdmin() {
  if (!(await isAdmin())) throw new Error("Not signed in.");
}

async function update(change: (projects: Project[]) => Project[]) {
  const projects = change(await getProjects());
  await saveProjects(projects);
  revalidatePath("/");
  revalidatePath("/admin");
  return projects;
}

export async function login(_: string | null, form: FormData) {
  const ok = await signIn(String(form.get("password") ?? ""));
  if (!ok) return "That password isn't right.";
  redirect("/admin");
}

export async function logout() {
  await signOut();
  redirect("/admin");
}

export async function addProject(input: Omit<Project, "id">) {
  await requireAdmin();
  const title = String(input.title ?? "").trim().slice(0, 120);
  const width = Math.round(Number(input.width));
  const height = Math.round(Number(input.height));
  if (!isBlobUrl(input.url)) throw new Error("Invalid file URL.");
  if (input.kind !== "image" && input.kind !== "video") throw new Error("Invalid file type.");
  if (!(width > 0 && height > 0)) throw new Error("Invalid dimensions.");

  const project: Project = { id: crypto.randomUUID(), title, kind: input.kind, url: input.url, width, height };
  // New uploads go to the top of the grid.
  return update((projects) => [project, ...projects]);
}

export async function renameProject(id: string, title: string) {
  await requireAdmin();
  const clean = String(title).trim().slice(0, 120);
  return update((projects) => projects.map((p) => (p.id === id ? { ...p, title: clean } : p)));
}

export async function reorderProjects(ids: string[]) {
  await requireAdmin();
  return update((projects) => {
    const rank = new Map(ids.map((id, i) => [String(id), i]));
    // Anything missing from the new order (e.g. added in another tab) keeps
    // its place at the end rather than being dropped.
    const at = (p: Project) => rank.get(p.id) ?? ids.length + projects.indexOf(p);
    return [...projects].sort((a, b) => at(a) - at(b));
  });
}

export async function deleteProject(id: string) {
  await requireAdmin();
  const target = (await getProjects()).find((p) => p.id === id);
  const projects = await update((list) => list.filter((p) => p.id !== id));
  if (target) await del(target.url).catch((error) => console.error("Could not delete file", error));
  return projects;
}

export async function updateKnowledge(text: string) {
  await requireAdmin();
  const clean = String(text);
  if (!clean.trim()) throw new Error("The knowledge base can't be empty.");
  if (clean.length > MAX_KNOWLEDGE_LENGTH) throw new Error("That's too long to save.");
  await saveKnowledge(clean);
  revalidatePath("/admin/knowledge");
  return new Date().toISOString();
}

export async function updateHighlights(input: Highlight[]) {
  await requireAdmin();
  if (!Array.isArray(input) || input.length > MAX_HIGHLIGHTS) throw new Error("Too many highlights.");
  const clean: Highlight[] = input
    .map((h) => ({
      id: String(h.id || crypto.randomUUID()).slice(0, 64),
      title: String(h.title ?? "").trim().slice(0, 80),
      detail: String(h.detail ?? "").trim().slice(0, 120),
      icon: HIGHLIGHT_ICON_NAMES.includes(h.icon) ? h.icon : "trophy",
      ...(h.image && isBlobUrl(h.image) ? { image: h.image } : {}),
    }))
    .filter((h) => h.title);

  // Remove uploaded icons that are no longer used.
  const keep = new Set(clean.map((h) => h.image).filter(Boolean));
  const dropped = (await getHighlights()).map((h) => h.image).filter((url): url is string => !!url && !keep.has(url));

  await saveHighlights(clean);
  if (dropped.length) await del(dropped).catch((error) => console.error("Could not delete icons", error));
  revalidatePath("/");
  revalidatePath("/admin/highlights");
  return clean;
}

export async function clearQuestionLog() {
  await requireAdmin();
  await clearQuestions();
  revalidatePath("/admin/questions");
}

/** Approves an answer for a question the chatbot couldn't answer. */
// Returns a message rather than throwing, since thrown messages are hidden in production.
export async function approveAnswer(
  url: string,
  question: string,
  answer: string,
): Promise<{ error?: string }> {
  await requireAdmin();
  if (!isBlobUrl(url)) return { error: "That question couldn't be found." };
  const q = String(question).trim().slice(0, 500);
  const a = String(answer).trim().slice(0, 2000);
  if (!q || !a) return { error: "Write an answer first." };
  if (/\[[^\]]+\]/.test(a)) return { error: "Fill in the [bracketed] parts first." };
  try {
    await addToKnowledge(q, a);
    await resolveQuestion(url, "added");
  } catch (error) {
    console.error("Could not approve answer", error);
    return { error: "That didn't save. Try again." };
  }
  revalidatePath("/admin/questions");
  revalidatePath("/admin/knowledge");
  return {};
}

export async function dismissQuestion(url: string) {
  await requireAdmin();
  if (!isBlobUrl(url)) throw new Error("Invalid question.");
  await resolveQuestion(url, "dismissed");
  revalidatePath("/admin/questions");
}
