"use client";

import { useEffect, useState } from "react";
import { upload } from "@vercel/blob/client";
import { updateHighlights } from "@/app/admin/actions";
import { HighlightsCard } from "@/components/HighlightsCard";
import {
  HIGHLIGHT_ICON_NAMES,
  HighlightIconSvg,
  MAX_HIGHLIGHTS,
  type Highlight,
} from "@/lib/highlight-icons";
import { ICON_TYPES, MAX_ICON_BYTES } from "@/lib/media";
import styles from "./HighlightsEditor.module.css";
import admin from "./Admin.module.css";

type Status = { kind: "idle" | "saving" | "saved" | "error"; message?: string };

const blank = (): Highlight => ({ id: crypto.randomUUID(), title: "", detail: "", icon: "trophy" });

export function HighlightsEditor({
  initial,
  storageReady,
}: {
  initial: Highlight[];
  storageReady: boolean;
}) {
  const [items, setItems] = useState<Highlight[]>(initial.length ? initial : [blank()]);
  const [saved, setSaved] = useState(JSON.stringify(initial));
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [uploading, setUploading] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);

  const filled = items.filter((h) => h.title.trim());
  const dirty = JSON.stringify(filled) !== saved;

  // Warn before leaving with unsaved edits.
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const patch = (id: string, change: Partial<Highlight>) => {
    setItems((list) => list.map((h) => (h.id === id ? { ...h, ...change } : h)));
    if (status.kind !== "saving") setStatus({ kind: "idle" });
  };

  function move(from: number, to: number) {
    if (to < 0 || to >= items.length || from === to) return;
    setItems((list) => {
      const next = [...list];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  }

  async function uploadIcon(id: string, file: File) {
    if (!ICON_TYPES.includes(file.type)) {
      setStatus({ kind: "error", message: "Use a PNG, JPG, WebP or SVG for icons." });
      return;
    }
    if (file.size > MAX_ICON_BYTES) {
      setStatus({ kind: "error", message: "Icons can be up to 2 MB." });
      return;
    }
    setUploading(id);
    try {
      const blob = await upload(`highlights/${file.name}`, file, {
        access: "public",
        handleUploadUrl: "/api/admin/upload",
      });
      patch(id, { image: blob.url });
    } catch {
      setStatus({ kind: "error", message: "That icon didn't upload. Try again." });
    } finally {
      setUploading(null);
    }
  }

  async function save() {
    if (!dirty || status.kind === "saving") return;
    setStatus({ kind: "saving" });
    try {
      const result = await updateHighlights(filled);
      setSaved(JSON.stringify(result));
      setItems(result.length ? result : [blank()]);
      setStatus({
        kind: "saved",
        message: result.length
          ? "Saved. The homepage shows them now."
          : "Saved. With no highlights, the tile is hidden on the homepage.",
      });
    } catch {
      setStatus({ kind: "error", message: "That didn't save. Check your connection and try again." });
    }
  }

  return (
    <div className={admin.manager}>
      <header className={admin.header}>
        <div>
          <h1 className={admin.title}>Highlights</h1>
          <p className={admin.hint}>
            Awards, features and mentions, shown one at a time in the seal on the homepage. Drag to
            reorder. Highlights without a title aren&apos;t saved.
          </p>
        </div>
        <div className={admin.headerActions}>
          <span className={admin.hint} aria-live="polite">
            {status.kind === "saving" ? "Saving…" : dirty ? "Unsaved changes" : ""}
          </span>
          <button
            type="button"
            className={admin.primary}
            onClick={save}
            disabled={!storageReady || !dirty || status.kind === "saving" || uploading !== null}
          >
            Save
          </button>
        </div>
      </header>

      {!storageReady && (
        <p className={admin.notice}>
          Saving needs Vercel Blob. Connect a Blob store with <code>BLOB_READ_WRITE_TOKEN</code> to the
          project.
        </p>
      )}
      {status.message && (
        <p className={status.kind === "error" ? admin.error : admin.hint} role="status">
          {status.message}
        </p>
      )}

      <div className={styles.layout}>
        <div className={styles.column}>
          <ol className={styles.list}>
            {items.map((h, i) => (
              <li
                key={h.id}
                className={styles.row}
                data-dragging={dragId === h.id || undefined}
                onDragOver={(e) => {
                  if (!dragId) return;
                  e.preventDefault();
                  const from = items.findIndex((x) => x.id === dragId);
                  if (from !== i) move(from, i);
                }}
              >
                <span
                  className={styles.handle}
                  draggable
                  role="button"
                  tabIndex={0}
                  aria-label={`Reorder ${h.title || "highlight"}. Use the up and down arrow keys to move it.`}
                  onDragStart={(e) => {
                    e.dataTransfer.effectAllowed = "move";
                    e.dataTransfer.setData("text/plain", h.id);
                    setDragId(h.id);
                  }}
                  onDragEnd={() => setDragId(null)}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                      e.preventDefault();
                      move(i, i + (e.key === "ArrowUp" ? -1 : 1));
                    }
                  }}
                >
                  <svg width="10" height="16" viewBox="0 0 10 16" aria-hidden="true">
                    {[2, 8, 14].flatMap((y) => [
                      <circle key={`l${y}`} cx="2" cy={y} r="1.5" />,
                      <circle key={`r${y}`} cx="8" cy={y} r="1.5" />,
                    ])}
                  </svg>
                </span>

                <div className={styles.iconBox} data-busy={uploading === h.id || undefined}>
                  {h.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={h.image} alt="" />
                  ) : (
                    <HighlightIconSvg icon={h.icon} size={30} />
                  )}
                </div>

                <div className={styles.fields}>
                  <label className="visually-hidden" htmlFor={`title-${h.id}`}>
                    Award
                  </label>
                  <input
                    id={`title-${h.id}`}
                    className={admin.field}
                    placeholder="Award, e.g. Site of the Day"
                    value={h.title}
                    maxLength={80}
                    onChange={(e) => patch(h.id, { title: e.target.value })}
                  />
                  <label className="visually-hidden" htmlFor={`detail-${h.id}`}>
                    Details
                  </label>
                  <input
                    id={`detail-${h.id}`}
                    className={admin.field}
                    placeholder="Who and for what, e.g. Awwwards · Ordin, 2026"
                    value={h.detail}
                    maxLength={120}
                    onChange={(e) => patch(h.id, { detail: e.target.value })}
                  />
                  <div className={styles.icons} role="group" aria-label="Icon">
                    {HIGHLIGHT_ICON_NAMES.map((name) => (
                      <button
                        key={name}
                        type="button"
                        className={styles.iconChoice}
                        aria-label={name}
                        aria-pressed={!h.image && h.icon === name}
                        onClick={() => patch(h.id, { icon: name, image: undefined })}
                      >
                        <HighlightIconSvg icon={name} size={18} />
                      </button>
                    ))}
                    <label className={styles.upload} data-active={h.image ? true : undefined}>
                      <input
                        type="file"
                        accept={ICON_TYPES.join(",")}
                        className="visually-hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) uploadIcon(h.id, file);
                          e.target.value = "";
                        }}
                      />
                      {uploading === h.id ? "Uploading…" : h.image ? "Replace icon" : "Upload icon"}
                    </label>
                  </div>
                </div>

                <button
                  type="button"
                  className={admin.link}
                  onClick={() => setItems((list) => list.filter((x) => x.id !== h.id))}
                >
                  Remove
                </button>
              </li>
            ))}
          </ol>

          {items.length < MAX_HIGHLIGHTS && (
            <button
              type="button"
              className={styles.add}
              onClick={() => setItems((list) => [...list, blank()])}
            >
              + Add highlight
            </button>
          )}
        </div>

        <aside className={styles.preview} aria-label="Preview">
          <p className={admin.hint}>Preview</p>
          {filled.length ? (
            <HighlightsCard highlights={filled} />
          ) : (
            <p className={admin.hint}>Add a highlight with a title to see it here.</p>
          )}
        </aside>
      </div>
    </div>
  );
}
