"use client";

import { useState } from "react";
import Link from "next/link";
import { upload } from "@vercel/blob/client";
import { addProject, deleteProject, logout, moveProject, renameProject } from "@/app/admin/actions";
import { ALLOWED_TYPES, MAX_UPLOAD_BYTES } from "@/lib/media";
import type { Project } from "@/lib/projects";
import styles from "./Admin.module.css";

type Upload = { key: string; name: string; progress: number; error?: string };

function measure(file: File): Promise<{ width: number; height: number }> {
  const url = URL.createObjectURL(file);
  return new Promise<{ width: number; height: number }>((resolve, reject) => {
    if (file.type.startsWith("video/")) {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.onloadedmetadata = () => resolve({ width: video.videoWidth, height: video.videoHeight });
      video.onerror = () => reject(new Error("Couldn't read this video."));
      video.src = url;
    } else {
      const img = new Image();
      img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
      img.onerror = () => reject(new Error("Couldn't read this image."));
      img.src = url;
    }
  }).finally(() => URL.revokeObjectURL(url));
}

function titleFromName(name: string) {
  return name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim();
}

export function ProjectManager({
  initialProjects,
  storageReady,
}: {
  initialProjects: Project[];
  storageReady: boolean;
}) {
  const [projects, setProjects] = useState(initialProjects);
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [dragging, setDragging] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const patchUpload = (key: string, patch: Partial<Upload>) =>
    setUploads((list) => list.map((u) => (u.key === key ? { ...u, ...patch } : u)));

  async function uploadFiles(files: File[]) {
    const queued = files.map((file) => ({ file, key: `${file.name}-${crypto.randomUUID()}` }));
    setUploads((list) => [...list, ...queued.map(({ file, key }) => ({ key, name: file.name, progress: 0 }))]);

    // One at a time, so each new project is saved to the list in order.
    for (const { file, key } of queued) {
      try {
        if (!ALLOWED_TYPES.includes(file.type)) throw new Error("Use a PNG, JPG, GIF, or MP4.");
        if (file.size > MAX_UPLOAD_BYTES) throw new Error("Files can be up to 500 MB.");
        const { width, height } = await measure(file);
        const blob = await upload(`projects/${file.name}`, file, {
          access: "public",
          handleUploadUrl: "/api/admin/upload",
          multipart: file.size > 50 * 1024 * 1024,
          onUploadProgress: ({ percentage }) => patchUpload(key, { progress: percentage }),
        });
        setProjects(
          await addProject({
            title: titleFromName(file.name),
            kind: file.type.startsWith("video/") ? "video" : "image",
            url: blob.url,
            width,
            height,
          }),
        );
        setUploads((list) => list.filter((u) => u.key !== key));
      } catch (err) {
        patchUpload(key, { error: err instanceof Error ? err.message : "Upload failed." });
      }
    }
  }

  async function run(id: string, action: () => Promise<Project[]>) {
    setBusyId(id);
    setError(null);
    try {
      setProjects(await action());
    } catch {
      setError("That change didn't save. Refresh the page and try again.");
    } finally {
      setBusyId(null);
      setConfirmId(null);
    }
  }

  return (
    <div className={styles.manager}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Projects</h1>
          <p className={styles.hint}>
            {projects.length} on the homepage, newest first. Drag in PNG, JPG, GIF, or MP4 files.
          </p>
        </div>
        <div className={styles.headerActions}>
          <Link href="/" className={styles.secondary}>
            View site
          </Link>
          <form action={logout}>
            <button type="submit" className={styles.secondary}>
              Sign out
            </button>
          </form>
        </div>
      </header>

      {!storageReady ? (
        <p className={styles.notice}>
          Uploads need Vercel Blob. Create a Blob store in your Vercel project, then add its{" "}
          <code>BLOB_READ_WRITE_TOKEN</code> to the environment.
        </p>
      ) : (
        <label
          className={styles.dropzone}
          data-dragging={dragging}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            uploadFiles(Array.from(e.dataTransfer.files));
          }}
        >
          <input
            id="project-files"
            type="file"
            multiple
            accept={ALLOWED_TYPES.join(",")}
            className="visually-hidden"
            onChange={(e) => {
              uploadFiles(Array.from(e.target.files ?? []));
              e.target.value = "";
            }}
          />
          <span className={styles.dropTitle}>Drop files here or click to choose</span>
          <span className={styles.hint}>PNG, JPG, GIF, or MP4 · up to 500 MB each</span>
        </label>
      )}

      {uploads.length > 0 && (
        <ul className={styles.uploads}>
          {uploads.map((u) => (
            <li key={u.key} className={styles.upload}>
              <span className={styles.uploadName}>{u.name}</span>
              {u.error ? (
                <span className={styles.uploadError}>
                  {u.error}
                  <button
                    type="button"
                    className={styles.link}
                    onClick={() => setUploads((list) => list.filter((x) => x.key !== u.key))}
                  >
                    Dismiss
                  </button>
                </span>
              ) : (
                <progress max={100} value={u.progress} className={styles.progress} />
              )}
            </li>
          ))}
        </ul>
      )}

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      {projects.length === 0 ? (
        <p className={styles.empty}>
          No projects yet. Until you upload one, the homepage shows the sample Ordin work.
        </p>
      ) : (
        <ol className={styles.list}>
          {projects.map((project, i) => (
            <li key={project.id} className={styles.item} aria-busy={busyId === project.id}>
              <div className={styles.thumb}>
                {project.kind === "video" ? (
                  <video src={project.url} muted loop playsInline autoPlay preload="metadata" />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={project.url} alt="" loading="lazy" />
                )}
              </div>
              <div className={styles.meta}>
                <label htmlFor={`title-${project.id}`} className="visually-hidden">
                  Title
                </label>
                <input
                  id={`title-${project.id}`}
                  className={styles.field}
                  defaultValue={project.title}
                  placeholder="Untitled"
                  onBlur={(e) => {
                    const title = e.target.value.trim();
                    if (title !== project.title) run(project.id, () => renameProject(project.id, title));
                  }}
                />
                <span className={styles.hint}>
                  {project.kind === "video" ? "Video" : "Image"} · {project.width}×{project.height}
                </span>
              </div>
              <div className={styles.itemActions}>
                <button
                  type="button"
                  className={styles.icon}
                  aria-label={`Move ${project.title || "project"} up`}
                  disabled={i === 0 || busyId !== null}
                  onClick={() => run(project.id, () => moveProject(project.id, -1))}
                >
                  ↑
                </button>
                <button
                  type="button"
                  className={styles.icon}
                  aria-label={`Move ${project.title || "project"} down`}
                  disabled={i === projects.length - 1 || busyId !== null}
                  onClick={() => run(project.id, () => moveProject(project.id, 1))}
                >
                  ↓
                </button>
                {confirmId === project.id ? (
                  <>
                    <button
                      type="button"
                      className={styles.danger}
                      disabled={busyId !== null}
                      onClick={() => run(project.id, () => deleteProject(project.id))}
                    >
                      Delete
                    </button>
                    <button type="button" className={styles.link} onClick={() => setConfirmId(null)}>
                      Cancel
                    </button>
                  </>
                ) : (
                  <button type="button" className={styles.link} onClick={() => setConfirmId(project.id)}>
                    Remove
                  </button>
                )}
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
