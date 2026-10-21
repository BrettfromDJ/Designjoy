"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import type { WorkItem } from "@/content/site";
import { useFrameCycle } from "@/lib/use-frame-cycle";
import { CodedWork } from "./work/CodedWork";
import styles from "./Lightbox.module.css";

const isGif = (src: string) => src.toLowerCase().split("?")[0].endsWith(".gif");

export function Lightbox({
  items,
  index,
  onIndex,
  onClose,
}: {
  items: WorkItem[];
  index: number;
  onIndex: (index: number) => void;
  onClose: () => void;
}) {
  const item = items[index];
  const count = items.length;
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const touchX = useRef<number | null>(null);
  const stageRef = useRef<HTMLElement>(null);
  const frame = useFrameCycle(item.kind === "image" ? 1 + (item.frames?.length ?? 0) : 1, stageRef, item.id);

  const go = (step: number) => onIndex((index + step + count) % count);

  // Keyboard: arrows to move, Esc to close, Tab stays inside the viewer.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") onIndex((index + 1) % count);
      else if (e.key === "ArrowLeft") onIndex((index - 1 + count) % count);
      else if (e.key === "Tab") {
        const focusable = dialogRef.current?.querySelectorAll<HTMLElement>("button");
        if (!focusable?.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, count, onIndex, onClose]);

  // Lock page scroll while open, hide the ask box so the work has the room
  // (see AskBox.module.css), and hand focus back to the tile on close.
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.body.dataset.viewing = "";
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = overflow;
      delete document.body.dataset.viewing;
      previous?.focus();
    };
  }, []);

  return (
    <div
      ref={dialogRef}
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-label={`${item.title} (${index + 1} of ${count})`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onTouchStart={(e) => {
        touchX.current = e.touches[0].clientX;
      }}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        touchX.current = null;
        if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
      }}
    >
      <button
        ref={closeRef}
        type="button"
        className={styles.close}
        onClick={onClose}
        aria-label="Close"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
          <path
            d="M1 1l12 12M13 1L1 13"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>

      <figure
        key={item.id}
        ref={stageRef}
        className={styles.stage}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        {item.kind === "coded" ? (
          <div
            className={styles.media}
            style={{ "--ratio": item.width / item.height } as React.CSSProperties}
            aria-label={item.title}
          >
            <CodedWork item={item} large />
          </div>
        ) : item.kind === "video" ? (
          <video
            src={item.src}
            width={item.width}
            height={item.height}
            className={styles.media}
            style={{ "--ratio": item.width / item.height } as React.CSSProperties}
            autoPlay
            muted
            loop
            playsInline
            controls
            aria-label={item.title}
          />
        ) : (
          <span className={styles.frames}>
            <Image
              src={item.src}
              alt={item.title}
              width={item.width}
              height={item.height}
              sizes="90vw"
              quality={95}
              unoptimized={isGif(item.src)}
              className={styles.media}
              style={{ "--ratio": item.width / item.height } as React.CSSProperties}
              data-hidden={frame !== 0 || undefined}
              priority
            />
            {/* Extra frames cut in turn on top of the first, like a GIF. */}
            {(item.frames ?? []).map((src, i) => (
              <Image
                key={src}
                src={src}
                alt=""
                fill
                sizes="90vw"
                quality={95}
                unoptimized={isGif(src)}
                className={styles.frame}
                data-hidden={frame !== i + 1 || undefined}
              />
            ))}
          </span>
        )}
      </figure>

      {count > 1 && (
        <>
          <button
            type="button"
            className={`${styles.arrow} ${styles.prev}`}
            onClick={() => go(-1)}
            aria-label="Previous project"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
              <path
                d="M10 3L5 8l5 5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button
            type="button"
            className={`${styles.arrow} ${styles.next}`}
            onClick={() => go(1)}
            aria-label="Next project"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
              <path
                d="M6 3l5 5-5 5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </>
      )}
    </div>
  );
}
