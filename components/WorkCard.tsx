"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { WorkItem } from "@/content/site";
import styles from "./WorkCard.module.css";

export function WorkCard({
  item,
  priority,
  order = 0,
}: {
  item: WorkItem;
  priority?: boolean;
  /** Position in the grid, used to cascade the reveal. */
  order?: number;
}) {
  const [loaded, setLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // A video that finished loading before hydration never fires the event.
  useEffect(() => {
    if ((videoRef.current?.readyState ?? 0) >= 2) setLoaded(true);
  }, []);

  return (
    <figure
      className={styles.card}
      data-loaded={loaded}
      style={{ "--reveal-delay": `${Math.min(order, 12) * 60}ms` } as React.CSSProperties}
    >
      {item.kind === "video" ? (
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
        <Image
          src={item.src}
          alt={item.title}
          width={item.width}
          height={item.height}
          sizes="(min-width: 1100px) 25vw, (min-width: 820px) 33vw, (min-width: 560px) 50vw, 100vw"
          priority={priority}
          // Resizing would drop a GIF's animation.
          unoptimized={item.src.toLowerCase().split("?")[0].endsWith(".gif")}
          className={styles.media}
          onLoad={() => setLoaded(true)}
          onError={() => setLoaded(true)}
        />
      )}
    </figure>
  );
}
