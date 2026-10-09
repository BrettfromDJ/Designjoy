"use client";

import { useEffect, useMemo, useRef, useState, type DragEvent, type KeyboardEvent } from "react";
import { drawFrame, encodeGif, type Fit, type Quality } from "@/lib/labs/gif";
import styles from "./SequenceTool.module.css";

type Frame = { id: string; name: string; url: string; img: HTMLImageElement };
type Size = "480" | "800" | "1080" | "original";
type Result = { url: string; bytes: number; width: number; height: number };

const SIZES: { value: Size; label: string }[] = [
  { value: "480", label: "480" },
  { value: "800", label: "800" },
  { value: "1080", label: "1080" },
  { value: "original", label: "Original" },
];
const QUALITIES: { value: Quality; label: string }[] = [
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];
/** "Original" still caps the width, so a 4K mockup doesn't make a 40 MB GIF. */
const MAX_WIDTH = 2000;
/** The preview canvas never needs to be bigger than this. */
const PREVIEW_WIDTH = 1080;
const FRAME_TYPE = "application/x-designjoy-frame";

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
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <fieldset className={styles.setting}>
      <legend className={styles.settingLabel}>{label}</legend>
      <div className={styles.segmented}>
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            aria-pressed={o.value === value}
            onClick={() => onChange(o.value)}
          >
            {o.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

export function SequenceTool() {
  const [frames, setFrames] = useState<Frame[]>([]);
  const [seconds, setSeconds] = useState(1);
  const [size, setSize] = useState<Size>("800");
  const [quality, setQuality] = useState<Quality>("high");
  const [fit, setFit] = useState<Fit>("fill");
  const [background, setBackground] = useState<"#000000" | "#ffffff">("#000000");
  const [loop, setLoop] = useState(true);
  const [current, setCurrent] = useState(0);
  const [progress, setProgress] = useState<number | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dropping, setDropping] = useState(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const stripRef = useRef<HTMLOListElement>(null);
  const framesRef = useRef(frames);
  framesRef.current = frames;

  // Output size follows the first image's shape.
  const output = useMemo(() => {
    const first = frames[0]?.img;
    if (!first) return null;
    const width =
      size === "original" ? Math.min(first.naturalWidth, MAX_WIDTH) : Number(size);
    const height = Math.max(1, Math.round((width * first.naturalHeight) / first.naturalWidth));
    return { width, height };
  }, [frames, size]);

  // Any change makes the last export stale.
  useEffect(() => {
    setResult((old) => {
      if (old) URL.revokeObjectURL(old.url);
      return null;
    });
  }, [frames, seconds, size, quality, fit, background, loop]);

  // Free the images when leaving the page.
  useEffect(
    () => () => framesRef.current.forEach((f) => URL.revokeObjectURL(f.url)),
    [],
  );

  // Play the preview at the chosen speed.
  useEffect(() => {
    if (frames.length < 2) {
      setCurrent(0);
      return;
    }
    const timer = setInterval(
      () => setCurrent((i) => (i + 1) % frames.length),
      seconds * 1000,
    );
    return () => clearInterval(timer);
  }, [frames.length, seconds]);

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

  async function addFiles(files: File[]) {
    const images = files.filter((f) => f.type.startsWith("image/"));
    if (!images.length) {
      if (files.length) setError("Those weren't images. Use PNG, JPG, WebP or GIF files.");
      return;
    }
    setError(null);
    const loaded = await Promise.allSettled(images.map(loadImage));
    const ok = loaded.flatMap((r) => (r.status === "fulfilled" ? [r.value] : []));
    const failed = loaded.length - ok.length;
    if (failed) setError(`${failed} file${failed === 1 ? "" : "s"} couldn't be read.`);
    setFrames((list) => [...list, ...ok]);
  }

  // Paste images straight from the clipboard.
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const files = Array.from(e.clipboardData?.files ?? []);
      if (files.length) addFiles(files);
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, []);

  function remove(id: string) {
    setFrames((list) => {
      const gone = list.find((f) => f.id === id);
      if (gone) URL.revokeObjectURL(gone.url);
      return list.filter((f) => f.id !== id);
    });
    setCurrent(0);
  }

  function clearAll() {
    frames.forEach((f) => URL.revokeObjectURL(f.url));
    setFrames([]);
    setError(null);
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

  async function exportGif() {
    if (!output || !frames.length) return;
    setError(null);
    setProgress(0);
    try {
      const blob = await encodeGif({
        images: frames.map((f) => f.img),
        ...output,
        delay: Math.round(seconds * 1000),
        loop,
        quality,
        fit,
        background,
        onProgress: setProgress,
      });
      setResult({ url: URL.createObjectURL(blob), bytes: blob.size, ...output });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't make the GIF.");
    } finally {
      setProgress(null);
    }
  }

  // Dropping files anywhere on the tool adds them; dragging a thumbnail reorders.
  const isFileDrag = (e: DragEvent) => e.dataTransfer.types.includes("Files");

  function onThumbKey(e: KeyboardEvent<HTMLLIElement>, index: number, id: string) {
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      e.preventDefault();
      move(index, index + (e.key === "ArrowLeft" ? -1 : 1));
      requestAnimationFrame(() =>
        stripRef.current?.querySelector<HTMLElement>(`[data-id="${id}"]`)?.focus(),
      );
    } else if (e.key === "Backspace" || e.key === "Delete") {
      e.preventDefault();
      remove(id);
    }
  }

  const busy = progress !== null;
  const total = frames.length * seconds;

  return (
    <div
      className={styles.tool}
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

      <section className={styles.stage} data-dropping={dropping || undefined} aria-label="Preview">
        {frames.length === 0 ? (
          <button type="button" className={styles.empty} onClick={() => inputRef.current?.click()}>
            <span className={styles.emptyTitle}>Drop images here</span>
            <span className={styles.hint}>or click to choose files. You can also paste.</span>
          </button>
        ) : (
          <>
            <div className={styles.preview}>
              <canvas
                ref={canvasRef}
                className={styles.canvas}
                style={output ? { aspectRatio: `${output.width} / ${output.height}` } : undefined}
              />
            </div>

            <div className={styles.stripHeader}>
              <span className={styles.hint}>
                {frames.length} frame{frames.length === 1 ? "" : "s"} · {total.toFixed(1)}s
                {frames.length > 1 && " · drag to reorder"}
              </span>
              <span className={styles.stripActions}>
                <button type="button" className={styles.link} onClick={() => inputRef.current?.click()}>
                  Add images
                </button>
                <button type="button" className={styles.link} onClick={clearAll}>
                  Clear
                </button>
              </span>
            </div>

            <ol className={styles.strip} ref={stripRef}>
              {frames.map((frame, i) => (
                <li
                  key={frame.id}
                  data-id={frame.id}
                  className={styles.thumb}
                  data-current={i === current || undefined}
                  data-dragging={draggingId === frame.id || undefined}
                  tabIndex={0}
                  aria-label={`Frame ${i + 1}, ${frame.name}. Arrow keys move it, Delete removes it.`}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData(FRAME_TYPE, frame.id);
                    e.dataTransfer.effectAllowed = "move";
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
                  onKeyDown={(e) => onThumbKey(e, i, frame.id)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={frame.url} alt="" draggable={false} />
                  <span className={styles.index}>{i + 1}</span>
                  <button
                    type="button"
                    className={styles.remove}
                    aria-label={`Remove frame ${i + 1}`}
                    tabIndex={-1}
                    onClick={() => remove(frame.id)}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ol>
          </>
        )}
      </section>

      <aside className={styles.panel} aria-label="Settings">
        <div className={styles.setting}>
          <label htmlFor="sequence-speed" className={styles.settingLabel}>
            Speed
            <span className={styles.value}>{seconds.toFixed(1)}s per frame</span>
          </label>
          <input
            id="sequence-speed"
            type="range"
            min={0.1}
            max={5}
            step={0.1}
            value={seconds}
            onChange={(e) => setSeconds(Number(e.target.value))}
            className={styles.range}
          />
        </div>

        <Segmented label="Width (px)" options={SIZES} value={size} onChange={setSize} />
        <Segmented label="Quality" options={QUALITIES} value={quality} onChange={setQuality} />
        <Segmented
          label="Images"
          options={[
            { value: "fill", label: "Crop to fill" },
            { value: "fit", label: "Fit inside" },
          ]}
          value={fit}
          onChange={setFit}
        />
        {fit === "fit" && (
          <Segmented
            label="Background"
            options={[
              { value: "#000000", label: "Black" },
              { value: "#ffffff", label: "White" },
            ]}
            value={background}
            onChange={setBackground}
          />
        )}
        <Segmented
          label="Loop"
          options={[
            { value: "forever", label: "Forever" },
            { value: "once", label: "Play once" },
          ]}
          value={loop ? "forever" : "once"}
          onChange={(v) => setLoop(v === "forever")}
        />

        <div className={styles.exportArea}>
          {output && (
            <p className={styles.hint}>
              Output {output.width} × {output.height}
            </p>
          )}
          {result ? (
            <>
              <a className={styles.primary} href={result.url} download="sequence.gif">
                Download GIF · {formatBytes(result.bytes)}
              </a>
              <button type="button" className={styles.link} onClick={exportGif}>
                Make it again
              </button>
            </>
          ) : (
            <button
              type="button"
              className={styles.primary}
              disabled={!frames.length || busy}
              onClick={exportGif}
            >
              {busy ? `Making GIF… ${progress}/${frames.length}` : "Make GIF"}
            </button>
          )}
          {busy && (
            <progress className={styles.progress} max={frames.length} value={progress ?? 0} />
          )}
          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}
        </div>
      </aside>
    </div>
  );
}
