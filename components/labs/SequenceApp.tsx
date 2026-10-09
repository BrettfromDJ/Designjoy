"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type DragEvent,
  type KeyboardEvent,
} from "react";
import { QUALITY, drawFrame, encodeGif, type Fit, type Quality } from "@/lib/labs/gif";
import styles from "./SequenceApp.module.css";

type Frame = { id: string; name: string; url: string; img: HTMLImageElement };
type Size = "480" | "800" | "1080" | "original";
type LogLine = { label: string; detail: string };
type Result = { url: string; bytes: number };
type Build =
  | { state: "idle" }
  | { state: "building"; lines: LogLine[] }
  | { state: "ready"; lines: LogLine[]; result: Result }
  | { state: "error"; lines: LogLine[]; message: string };

/** "Original" still caps the width, so a 4K mockup doesn't make a 40 MB GIF. */
const MAX_WIDTH = 2000;
/** The preview canvas never needs to be bigger than this. */
const PREVIEW_WIDTH = 1200;
const MIN_MS = 100;
const MAX_MS = 5000;

function loadImage(file: File): Promise<Frame> {
  const url = URL.createObjectURL(file);
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ id: crypto.randomUUID(), name: file.name, url, img });
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`Couldn't read ${file.name}.`));
    };
    img.src = url;
  });
}

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

const pad = (n: number) => String(n).padStart(2, "0");

function timecode(ms: number) {
  const s = Math.floor(ms / 1000);
  return `${pad(Math.floor(s / 60))}:${pad(s % 60)}.${String(Math.floor(ms % 1000)).padStart(3, "0")}`;
}

export function SequenceApp() {
  const [frames, setFrames] = useState<Frame[]>([]);
  const [ms, setMs] = useState(1000);
  const [size, setSize] = useState<Size>("800");
  const [quality, setQuality] = useState<Quality>("high");
  const [fit, setFit] = useState<Fit>("fill");
  const [background, setBackground] = useState("#000000");
  const [loop, setLoop] = useState(true);
  const [name, setName] = useState("sequence");
  const [current, setCurrent] = useState(0);
  const [build, setBuild] = useState<Build>({ state: "idle" });
  const [notice, setNotice] = useState<string | null>(null);
  const [dropping, setDropping] = useState(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const rowsRef = useRef<HTMLOListElement>(null);
  const segsRef = useRef<HTMLDivElement>(null);
  const clockRef = useRef<HTMLSpanElement>(null);
  const startRef = useRef(0);
  const framesRef = useRef(frames);
  framesRef.current = frames;

  // Output size follows the first image's shape.
  const output = useMemo(() => {
    const first = frames[0]?.img;
    if (!first) return null;
    const width = size === "original" ? Math.min(first.naturalWidth, MAX_WIDTH) : Number(size);
    const height = Math.max(1, Math.round((width * first.naturalHeight) / first.naturalWidth));
    return { width, height };
  }, [frames, size]);

  const total = frames.length * ms;
  const fileName = `${name.trim() || "sequence"}.gif`;

  // Any change makes the last export stale.
  useEffect(() => {
    setBuild((old) => {
      if (old.state === "ready") URL.revokeObjectURL(old.result.url);
      return { state: "idle" };
    });
  }, [frames, ms, size, quality, fit, background, loop]);

  useEffect(() => () => framesRef.current.forEach((f) => URL.revokeObjectURL(f.url)), []);

  // Playback: work out the frame from the clock, and fill the progress bars.
  useEffect(() => {
    startRef.current = performance.now() - current * ms;
    if (!frames.length) return;
    let raf = 0;
    const tick = (now: number) => {
      const elapsed = (now - startRef.current) % total;
      const index = Math.floor(elapsed / ms);
      const progress = (elapsed % ms) / ms;
      setCurrent((c) => (c === index ? c : index));
      segsRef.current?.querySelectorAll<HTMLElement>("b").forEach((bar, i) => {
        bar.style.transform = `scaleX(${i < index ? 1 : i === index ? progress : 0})`;
      });
      if (clockRef.current) clockRef.current.textContent = `${timecode(elapsed)} / ${timecode(total)}`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // Restart the clock only when the timing changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frames.length, ms, total]);

  // Draw the current frame exactly as the GIF will show it.
  useEffect(() => {
    const canvas = canvasRef.current;
    const frame = frames[current] ?? frames[0];
    if (!canvas || !output || !frame) return;
    const scale = Math.min(1, PREVIEW_WIDTH / output.width);
    const width = Math.round(output.width * scale);
    const height = Math.round(output.height * scale);
    if (canvas.width !== width) canvas.width = width;
    if (canvas.height !== height) canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (ctx) drawFrame(ctx, frame.img, width, height, fit, background);
  }, [frames, current, output, fit, background]);

  const addFiles = useCallback(async (files: File[]) => {
    const images = files.filter((f) => f.type.startsWith("image/"));
    if (!images.length) {
      if (files.length) setNotice("Those weren't images. Use PNG, JPG, WebP or GIF files.");
      return;
    }
    setNotice(null);
    const loaded = await Promise.allSettled(images.map(loadImage));
    const ok = loaded.flatMap((r) => (r.status === "fulfilled" ? [r.value] : []));
    const failed = loaded.length - ok.length;
    if (failed) setNotice(`${failed} file${failed === 1 ? "" : "s"} couldn't be read.`);
    setFrames((list) => [...list, ...ok]);
  }, []);

  function jumpTo(index: number) {
    setCurrent(index);
    startRef.current = performance.now() - index * ms;
  }

  function remove(id: string) {
    setFrames((list) => {
      const gone = list.find((f) => f.id === id);
      if (gone) URL.revokeObjectURL(gone.url);
      return list.filter((f) => f.id !== id);
    });
    jumpTo(0);
  }

  function clearAll() {
    frames.forEach((f) => URL.revokeObjectURL(f.url));
    setFrames([]);
    setNotice(null);
  }

  function move(from: number, to: number) {
    if (to < 0 || to >= frames.length || from === to) return;
    setFrames((list) => {
      const next = [...list];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  }

  const makeGif = useCallback(async () => {
    const list = framesRef.current;
    if (!output || !list.length || build.state === "building") return;
    const count = list.length;
    const lines: LogLine[] = [
      { label: "Reading frames", detail: `${count} × ${output.width}×${output.height}` },
    ];
    setBuild({ state: "building", lines: [...lines] });
    try {
      const blob = await encodeGif({
        images: list.map((f) => f.img),
        ...output,
        delay: ms,
        loop,
        quality,
        fit,
        background,
        onProgress: (done, took) => {
          lines.push({
            label: `Encoding ${pad(done)}/${pad(count)}`,
            detail: `${QUALITY[quality].colors} colors · ${Math.max(1, Math.round(took))}ms`,
          });
          setBuild({ state: "building", lines: [...lines] });
        },
      });
      lines.push({ label: "Writing GIF", detail: formatBytes(blob.size) });
      setBuild({ state: "ready", lines, result: { url: URL.createObjectURL(blob), bytes: blob.size } });
    } catch (err) {
      setBuild({
        state: "error",
        lines,
        message: err instanceof Error ? err.message : "Couldn't make the GIF.",
      });
    }
  }, [output, build.state, ms, loop, quality, fit, background]);

  // Paste images, and ⌘/Ctrl + Enter to make the GIF.
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const files = Array.from(e.clipboardData?.files ?? []);
      if (files.length) addFiles(files);
    };
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        makeGif();
      }
    };
    window.addEventListener("paste", onPaste);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("paste", onPaste);
      window.removeEventListener("keydown", onKey);
    };
  }, [addFiles, makeGif]);

  const isFileDrag = (e: DragEvent) => e.dataTransfer.types.includes("Files");

  function onRowKey(e: KeyboardEvent<HTMLLIElement>, index: number, id: string) {
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      move(index, index + (e.key === "ArrowUp" ? -1 : 1));
      requestAnimationFrame(() =>
        rowsRef.current?.querySelector<HTMLElement>(`[data-id="${id}"]`)?.focus(),
      );
    } else if (e.key === "Backspace" || e.key === "Delete") {
      e.preventDefault();
      remove(id);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      jumpTo(index);
    }
  }

  const setDuration = (value: number) =>
    setMs(Math.min(MAX_MS, Math.max(MIN_MS, Math.round(value / 10) * 10 || MIN_MS)));

  const empty = frames.length === 0;
  const building = build.state === "building";

  return (
    <div
      className={styles.app}
      data-dropping={dropping || undefined}
      onDragOver={(e) => {
        if (!isFileDrag(e)) return;
        e.preventDefault();
        setDropping(true);
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setDropping(false);
      }}
      onDrop={(e) => {
        if (!isFileDrag(e)) return;
        e.preventDefault();
        setDropping(false);
        addFiles(Array.from(e.dataTransfer.files));
      }}
    >
      <input
        ref={inputRef}
        id="sequence-files"
        type="file"
        accept="image/*"
        multiple
        className="visually-hidden"
        onChange={(e) => {
          addFiles(Array.from(e.target.files ?? []));
          e.target.value = "";
        }}
      />

      {/* Top bar */}
      <header className={styles.topbar}>
        <div className={styles.crumbs}>
          <Link href="/" className={styles.logo} aria-label="Designjoy home">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icons/smile.svg" alt="" width={22} height={22} />
          </Link>
          <Link href="/labs" className={styles.crumb}>
            Labs
          </Link>
          <span className={styles.slash}>/</span>
          <span className={styles.crumbCurrent}>Sequence</span>
        </div>
        <label className={styles.fileName}>
          <span className="visually-hidden">File name</span>
          {/* The hidden copy sizes the field to its text. */}
          <span className={styles.sizer}>
            <span aria-hidden="true">{name || " "}</span>
            <input
              id="sequence-name"
              value={name}
              onChange={(e) => setName(e.target.value.replace(/[\\/:*?"<>|]/g, ""))}
              spellCheck={false}
              size={1}
            />
          </span>
          <span className={styles.ext}>.gif</span>
        </label>
        <div className={styles.topActions}>
          {output && (
            <span className={styles.mono}>
              {output.width} × {output.height} · {(total / 1000).toFixed(1)}s
            </span>
          )}
          <button type="button" className={styles.primary} disabled={empty || building} onClick={makeGif}>
            {building ? "Making…" : "Make GIF"}
            <kbd>⌘</kbd>
            <kbd>↵</kbd>
          </button>
        </div>
      </header>

      {/* Frames */}
      <aside className={styles.left} aria-label="Frames">
        <div className={styles.bar}>
          <span className={styles.barTitle}>
            Frames <span className={styles.mono}>{frames.length}</span>
          </span>
          <span className={styles.barActions}>
            {!empty && (
              <button type="button" className={styles.ghost} onClick={clearAll}>
                Clear
              </button>
            )}
            <button type="button" className={styles.ghost} onClick={() => inputRef.current?.click()}>
              + Add
            </button>
          </span>
        </div>
        {empty ? (
          <p className={styles.emptyList}>No frames yet. Drop, paste or add images and they&apos;ll line up here.</p>
        ) : (
          <ol className={styles.rows} ref={rowsRef}>
            {frames.map((frame, i) => (
              <li
                key={frame.id}
                data-id={frame.id}
                className={styles.row}
                data-current={i === current || undefined}
                data-dragging={draggingId === frame.id || undefined}
                tabIndex={0}
                aria-label={`Frame ${i + 1}, ${frame.name}. Up and down arrows move it, Delete removes it.`}
                draggable
                onClick={() => jumpTo(i)}
                onDragStart={(e) => {
                  e.dataTransfer.effectAllowed = "move";
                  e.dataTransfer.setData("text/plain", frame.id);
                  setDraggingId(frame.id);
                }}
                onDragOver={(e) => {
                  if (!draggingId) return;
                  e.preventDefault();
                  const from = frames.findIndex((f) => f.id === draggingId);
                  if (from !== i) move(from, i);
                }}
                onDrop={(e) => {
                  if (draggingId) e.preventDefault();
                }}
                onDragEnd={() => setDraggingId(null)}
                onKeyDown={(e) => onRowKey(e, i, frame.id)}
              >
                <span className={styles.grip} aria-hidden="true">
                  ⋮⋮
                </span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={frame.url} alt="" draggable={false} />
                <span className={styles.rowName}>
                  {frame.name}
                  <span className={styles.mono}>
                    {frame.img.naturalWidth} × {frame.img.naturalHeight}
                  </span>
                </span>
                <span className={styles.rowEnd}>
                  <span className={styles.mono}>{ms}ms</span>
                  <button
                    type="button"
                    className={styles.remove}
                    aria-label={`Remove frame ${i + 1}`}
                    tabIndex={-1}
                    onClick={(e) => {
                      e.stopPropagation();
                      remove(frame.id);
                    }}
                  >
                    ×
                  </button>
                </span>
              </li>
            ))}
          </ol>
        )}
        <div className={styles.keys}>
          <span>
            <kbd>⌘</kbd>
            <kbd>V</kbd> paste
          </span>
          <span>
            <kbd>↑</kbd>
            <kbd>↓</kbd> move
          </span>
          <span>
            <kbd>⌫</kbd> remove
          </span>
        </div>
      </aside>

      {/* Canvas */}
      <main className={styles.center}>
        <div className={styles.bar}>
          <span className={styles.mono}>
            {empty ? "No frames" : `Frame ${pad(current + 1)} / ${pad(frames.length)}`}
          </span>
          <span className={styles.mono} ref={clockRef}>
            {timecode(0)} / {timecode(total)}
          </span>
        </div>
        <div className={styles.stage}>
          {empty ? (
            // An empty artboard, labelled like a frame in a design tool.
            <button type="button" className={styles.artboard} onClick={() => inputRef.current?.click()}>
              <span className={styles.artboardLabel}>
                <span>{fileName}</span>
                <span>{size === "original" ? "Original" : `${size} × —`}</span>
              </span>
              <span className={styles.artboardHint}>Drop, paste or click to add images</span>
            </button>
          ) : (
            <canvas ref={canvasRef} className={styles.canvas} />
          )}
        </div>
        <div className={styles.segs} ref={segsRef} aria-hidden="true">
          {frames.map((f, i) => (
            <button key={f.id} type="button" tabIndex={-1} onClick={() => jumpTo(i)}>
              <b />
            </button>
          ))}
        </div>
      </main>

      {/* Inspector */}
      <aside className={styles.right} aria-label="Settings">
        <div className={styles.bar}>
          <span className={styles.barTitle}>{fileName}</span>
          <span className={styles.label}>{build.state === "ready" ? "Ready" : "Draft"}</span>
        </div>
        <div className={styles.props}>
          <section className={styles.section}>
            <h2 className={styles.label}>Timing</h2>
            <div className={styles.prop}>
              <label htmlFor="sequence-ms">Frame</label>
              <span className={styles.stepper}>
                <button type="button" aria-label="Shorter" onClick={() => setDuration(ms - 100)}>
                  −
                </button>
                <input
                  id="sequence-ms"
                  inputMode="numeric"
                  value={ms}
                  onChange={(e) => {
                    const v = Number(e.target.value.replace(/\D/g, ""));
                    if (v) setMs(Math.min(MAX_MS, v));
                  }}
                  onBlur={(e) => setDuration(Number(e.target.value))}
                />
                <span className={styles.unit}>ms</span>
                <button type="button" aria-label="Longer" onClick={() => setDuration(ms + 100)}>
                  +
                </button>
              </span>
            </div>
            <div className={styles.prop}>
              <span>Total</span>
              <span className={styles.value}>{(total / 1000).toFixed(1)} s</span>
            </div>
            <div className={styles.prop}>
              <label htmlFor="sequence-loop">Loop</label>
              <select id="sequence-loop" value={loop ? "forever" : "once"} onChange={(e) => setLoop(e.target.value === "forever")}>
                <option value="forever">∞ Forever</option>
                <option value="once">Play once</option>
              </select>
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.label}>Output</h2>
            <div className={styles.prop}>
              <label htmlFor="sequence-width">Width</label>
              <select id="sequence-width" value={size} onChange={(e) => setSize(e.target.value as Size)}>
                <option value="480">480 px</option>
                <option value="800">800 px</option>
                <option value="1080">1080 px</option>
                <option value="original">Original</option>
              </select>
            </div>
            <div className={styles.prop}>
              <span>Height</span>
              <span className={styles.value}>{output ? `${output.height} px` : "Auto"}</span>
            </div>
            <div className={styles.prop}>
              <label htmlFor="sequence-fit">Fit</label>
              <select id="sequence-fit" value={fit} onChange={(e) => setFit(e.target.value as Fit)}>
                <option value="fill">Cover</option>
                <option value="fit">Contain</option>
              </select>
            </div>
            {fit === "fit" && (
              <div className={styles.prop}>
                <label htmlFor="sequence-bg">Background</label>
                <select id="sequence-bg" value={background} onChange={(e) => setBackground(e.target.value)}>
                  <option value="#000000">Black</option>
                  <option value="#ffffff">White</option>
                </select>
              </div>
            )}
          </section>

          <section className={styles.section}>
            <h2 className={styles.label}>Encoding</h2>
            <div className={styles.prop}>
              <label htmlFor="sequence-colors">Colors</label>
              <select id="sequence-colors" value={quality} onChange={(e) => setQuality(e.target.value as Quality)}>
                <option value="high">256</option>
                <option value="medium">128</option>
                <option value="low">48</option>
              </select>
            </div>
          </section>
        </div>

        <div className={styles.foot}>
          {build.state !== "idle" && (
            <ol className={styles.log} aria-live="polite">
              {build.lines.map((line, i) => (
                <li key={i}>
                  <span>{line.label}</span>
                  <span>{line.detail}</span>
                </li>
              ))}
              {build.state === "ready" && (
                <li className={styles.ok}>
                  <span>Ready</span>
                  <span>{formatBytes(build.result.bytes)}</span>
                </li>
              )}
              {build.state === "error" && (
                <li className={styles.fail}>
                  <span>{build.message}</span>
                </li>
              )}
            </ol>
          )}
          {build.state === "ready" ? (
            <a className={styles.primaryWide} href={build.result.url} download={fileName}>
              Download {fileName}
            </a>
          ) : (
            <>
              {build.state === "idle" && (
                <div className={styles.estimate}>
                  <span>Output</span>
                  <span className={styles.value}>
                    {output ? `${output.width} × ${output.height} · ${frames.length} frames` : "—"}
                  </span>
                </div>
              )}
              <button type="button" className={styles.primaryWide} disabled={empty || building} onClick={makeGif}>
                {building ? "Making GIF…" : "Make GIF"}
              </button>
            </>
          )}
          {notice && (
            <p className={styles.notice} role="alert">
              {notice}
            </p>
          )}
        </div>
      </aside>

      {dropping && (
        <div className={styles.dropOverlay} aria-hidden="true">
          <span>Drop to add frames</span>
        </div>
      )}
    </div>
  );
}
