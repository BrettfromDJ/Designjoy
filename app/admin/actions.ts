"use server";

import { del } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isAdmin, signIn, signOut } from "@/lib/auth";
import { MAX_KNOWLEDGE_LENGTH, saveKnowledge } from "@/lib/knowledge";
import { getProjects, isBlobUrl, saveProjects, type Project } from "@/lib/projects";

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

export async function moveProject(id: string, direction: -1 | 1) {
  await requireAdmin();
  return update((projects) => {
    const from = projects.findIndex((p) => p.id === id);
    const to = from + direction;
    if (from < 0 || to < 0 || to >= projects.length) return projects;
    const next = [...projects];
    [next[from], next[to]] = [next[to], next[from]];
    return next;
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
