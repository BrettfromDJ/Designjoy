import Image from "next/image";
import type { WorkItem } from "@/content/site";
import styles from "./WorkCard.module.css";

export function WorkCard({ item, priority }: { item: WorkItem; priority?: boolean }) {
  return (
    <figure className={styles.card}>
      {item.kind === "video" ? (
        <video
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
        />
      )}
    </figure>
  );
}
