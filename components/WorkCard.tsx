"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { WorkItem } from "@/content/site";
import { useFrameCycle } from "@/lib/use-frame-cycle";
import { CodedWork } from "./work/CodedWork";
import styles from "./WorkCard.module.css";

const SIZES = "(min-width: 1100px) 25vw, (min-width: 820px) 33vw, (min-width: 560px) 50vw, 100vw";
// Above Next's default of 75, which visibly softened the artwork.
const QUALITY = 90;
const isGif = (src: string) => src.toLowerCase().split("?")[0].endsWith(".gif");

export function WorkCard({
  item,
  priority,
  order = 0,
  onOpen,
  sizes = SIZES,
}: {
  item: WorkItem;
  priority?: boolean;
  /** How wide it shows, for picking the image size (default: a grid column). */
  sizes?: string;
  /** Position in the grid, used to cascade the reveal. */
  order?: number;
  onOpen?: () => void;
}) {
  // Coded pieces have nothing to load.
  const [loaded, setLoaded] = useState(item.kind === "coded");
  const videoRef = useRef<HTMLVideoElement>(null);
  const cardRef = useRef<HTMLElement>(null);
  const frames = item.kind === "image" ? [item.src, ...(item.frames ?? [])] : [item.src];
  const frame = useFrameCycle(frames.length, cardRef);

  // A video that finished loading before hydration never fires the event.
  useEffect(() => {
    if ((videoRef.current?.readyState ?? 0) >= 2) setLoaded(true);
  }, []);

  return (
    <figure
      ref={cardRef}
      className={styles.card}
      data-loaded={loaded}
      style={
        {
          "--reveal-delay": `${Math.min(order, 12) * 60}ms`,
          "--ratio": item.width / item.height,
        } as React.CSSProperties
      }
    >
      {item.kind === "coded" ? (
        <CodedWork item={item} />
      ) : item.kind === "video" ? (
        <video
          ref={videoRef}
          src={item.src}
          width={item.width}
          height={item.height}
          autoPlay
          muted
          loop
          playsInline
          preload={priority ? "auto" : "metadata"}
          aria-label={item.title}
          className={styles.media}
          onLoadedData={() => setLoaded(true)}
        />
      ) : (
        <>
          <Image
            src={item.src}
            alt={item.title}
            width={item.width}
            height={item.height}
            sizes={sizes}
            quality={QUALITY}
            priority={priority}
            // Resizing would drop a GIF's animation.
            unoptimized={isGif(item.src)}
            className={styles.media}
            data-hidden={frame !== 0 || undefined}
            onLoad={() => setLoaded(true)}
            onError={() => setLoaded(true)}
          />
          {/* Extra frames sit on top of the first and cut in turn, like a GIF. */}
          {frames.slice(1).map((src, i) => (
            <Image
              key={src}
              src={src}
              alt=""
              fill
              sizes={sizes}
              quality={QUALITY}
              unoptimized={isGif(src)}
              className={styles.frame}
              data-hidden={frame !== i + 1 || undefined}
            />
          ))}
        </>
      )}
      {onOpen && (
        <button
          type="button"
          className={styles.open}
          onClick={onOpen}
          aria-label={`View ${item.title || "project"}`}
        />
      )}
    </figure>
  );
}
