"use client";

import { useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { upload } from "@vercel/blob/client";
import { addProject, deleteProject, renameProject, reorderProjects } from "@/app/admin/actions";
import { ALLOWED_TYPES, MAX_UPLOAD_BYTES } from "@/lib/media";
import type { Project } from "@/lib/projects";
import styles from "./Admin.module.css";

type Upload = { key: string; name: string; progress: number; error?: string };

type Drag = {
  id: string;
  from: number;
  to: number;
  startY: number;
  /** Top and bottom of each row when the drag started. */
  rows: { top: number; bottom: number }[];
  /** How far the other rows slide to make room: the dragged row's height plus the gap. */
  step: number;
  pointerId: number;
  started: boolean;
};

/** Pixels the pointer has to travel before a press becomes a drag. */
const DRAG_THRESHOLD = 4;

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
  const [drag, setDrag] = useState<{ id: string; from: number; to: number; dy: number; step: number } | null>(
    null,
  );
  const listRef = useRef<HTMLOListElement>(null);
  const dragRef = useRef<Drag | null>(null);

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

  function saveOrder(next: Project[], id: string) {
    const previous = projects;
    setProjects(next);
    setBusyId(id);
    setError(null);
    reorderProjects(next.map((p) => p.id))
      .then(setProjects)
      .catch(() => {
        setProjects(previous);
        setError("That change didn't save. Refresh the page and try again.");
      })
      .finally(() => setBusyId(null));
  }

  function move(from: number, to: number) {
    if (from === to || to < 0 || to >= projects.length) return;
    const next = [...projects];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    saveOrder(next, item.id);
  }

  function onPointerDown(e: PointerEvent<HTMLLIElement>, index: number) {
    if (busyId !== null || e.button !== 0) return;
    const target = e.target as HTMLElement;
    if (target.closest("input, button, a")) return;
    // Touch drags start from the handle only, so the list still scrolls.
    if (e.pointerType !== "mouse" && !target.closest("[data-handle]")) return;

    const items = Array.from(listRef.current?.children ?? []) as HTMLElement[];
    const rows = items.map((el) => {
      const r = el.getBoundingClientRect();
      return { top: r.top, bottom: r.bottom };
    });
    const gap = rows.length > 1 ? rows[1].top - rows[0].bottom : 0;
    dragRef.current = {
      id: projects[index].id,
      from: index,
      to: index,
      startY: e.clientY,
      rows,
      step: rows[index].bottom - rows[index].top + gap,
      pointerId: e.pointerId,
      started: false,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: PointerEvent<HTMLLIElement>) {
    const d = dragRef.current;
    if (!d || e.pointerId !== d.pointerId) return;
    const dy = e.clientY - d.startY;
    if (!d.started) {
      if (Math.abs(dy) < DRAG_THRESHOLD) return;
      d.started = true;
    }
    e.preventDefault();

    // The dragged row lands wherever its middle now sits among the others.
    const own = d.rows[d.from];
    const middle = (own.top + own.bottom) / 2 + dy;
    let to = 0;
    d.rows.forEach((row, i) => {
      if (i !== d.from && middle > (row.top + row.bottom) / 2) to++;
    });
    d.to = to;
    setDrag({ id: d.id, from: d.from, to, dy, step: d.step });
  }

  function onPointerUp(e: PointerEvent<HTMLLIElement>) {
    const d = dragRef.current;
    if (!d || e.pointerId !== d.pointerId) return;
    dragRef.current = null;
    setDrag(null);
    if (d.started) move(d.from, d.to);
  }

  function onHandleKey(e: KeyboardEvent<HTMLSpanElement>, index: number) {
    if (busyId !== null) return;
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      const to = index + (e.key === "ArrowUp" ? -1 : 1);
      move(index, to);
      // Keep focus on the same project's handle after it moves.
      const id = projects[index]?.id;
      requestAnimationFrame(() =>
        listRef.current?.querySelector<HTMLElement>(`[data-handle="${id}"]`)?.focus(),
      );
    }
  }

  /** Where each row should sit while a drag is in progress. */
  function offset(index: number) {
    if (!drag) return undefined;
    if (index === drag.from) return drag.dy;
    if (drag.from < index && index <= drag.to) return -drag.step;
    if (drag.to <= index && index < drag.from) return drag.step;
    return 0;
  }

  return (
    <div className={styles.manager}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Projects</h1>
          <p className={styles.hint}>
            {projects.length} on the homepage, in this order. Drag a project to move it.
          </p>
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
        <ol className={styles.list} ref={listRef} data-dragging={drag !== null || undefined}>
          {projects.map((project, i) => (
            <li
              key={project.id}
              className={styles.item}
              aria-busy={busyId === project.id}
              data-lifted={drag?.id === project.id || undefined}
              style={drag ? { transform: `translateY(${offset(i)}px)` } : undefined}
              onPointerDown={(e) => onPointerDown(e, i)}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
            >
              <span
                className={styles.handle}
                data-handle={project.id}
                role="button"
                tabIndex={0}
                aria-label={`Reorder ${project.title || "project"}. Use the up and down arrow keys to move it.`}
                onKeyDown={(e) => onHandleKey(e, i)}
              >
                <svg width="10" height="16" viewBox="0 0 10 16" aria-hidden="true">
                  {[2, 8, 14].flatMap((y) => [
                    <circle key={`l${y}`} cx="2" cy={y} r="1.5" />,
                    <circle key={`r${y}`} cx="8" cy={y} r="1.5" />,
                  ])}
                </svg>
              </span>
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
