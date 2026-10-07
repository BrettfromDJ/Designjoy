"use client";

import { useEffect, useState } from "react";
import { updateKnowledge } from "@/app/admin/actions";
import styles from "./Admin.module.css";

type Status = { kind: "idle" | "saving" | "saved" | "error"; message?: string };

export function KnowledgeEditor({
  initialText,
  source,
  storageReady,
}: {
  initialText: string;
  source: "saved" | "default";
  storageReady: boolean;
}) {
  const [text, setText] = useState(initialText);
  const [savedText, setSavedText] = useState(initialText);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const dirty = text !== savedText;

  async function save() {
    if (!dirty || status.kind === "saving") return;
    setStatus({ kind: "saving" });
    try {
      const at = await updateKnowledge(text);
      setSavedText(text);
      const time = new Date(at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
      setStatus({ kind: "saved", message: `Saved at ${time}. The chatbot uses it within a minute.` });
    } catch {
      setStatus({ kind: "error", message: "That didn't save. Check your connection and try again." });
    }
  }

  // Warn before leaving with unsaved edits.
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  return (
    <div className={styles.manager}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Chatbot knowledge</h1>
          <p className={styles.hint}>
            Everything the &ldquo;Ask anything&rdquo; box knows. It answers only from this text, so add
            real client questions with exact answers.
          </p>
        </div>
        <div className={styles.headerActions}>
          <span className={styles.hint} aria-live="polite">
            {status.kind === "saving" ? "Saving…" : dirty ? "Unsaved changes" : ""}
          </span>
          <button
            type="button"
            className={styles.primary}
            onClick={save}
            disabled={!storageReady || !dirty || status.kind === "saving"}
          >
            Save
          </button>
        </div>
      </header>

      {!storageReady && (
        <p className={styles.notice}>
          Saving needs Vercel Blob. Connect a Blob store with <code>BLOB_READ_WRITE_TOKEN</code> to the
          project.
        </p>
      )}
      {storageReady && source === "default" && status.kind !== "saved" && (
        <p className={styles.hint}>
          This is the starter version from the site&apos;s code. Your first save replaces it.
        </p>
      )}
      {status.message && (
        <p className={status.kind === "error" ? styles.error : styles.hint} role="status">
          {status.message}
        </p>
      )}

      <label htmlFor="knowledge" className="visually-hidden">
        Knowledge base
      </label>
      <textarea
        id="knowledge"
        className={styles.editor}
        value={text}
        spellCheck
        onChange={(e) => {
          setText(e.target.value);
          if (status.kind !== "saving") setStatus({ kind: "idle" });
        }}
        onKeyDown={(e) => {
          if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
            e.preventDefault();
            save();
          }
        }}
      />
      <p className={styles.hint}>
        {text.length.toLocaleString()} characters · Markdown is fine · Lines inside &lt;!-- --&gt; are
        notes the chatbot ignores · Cmd/Ctrl+S to save
      </p>
    </div>
  );
}
