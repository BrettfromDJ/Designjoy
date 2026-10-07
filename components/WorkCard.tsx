import Image from "next/image";
import type { WorkItem } from "@/content/site";
import styles from "./WorkCard.module.css";

export function WorkCard({ item, priority }: { item: WorkItem; priority?: boolean }) {
  return (
    <figure className={styles.card}>
      <Image
        src={item.src}
        alt={item.title}
        width={item.width}
        height={item.height}
        sizes="(min-width: 1100px) 25vw, (min-width: 820px) 33vw, (min-width: 560px) 50vw, 100vw"
        priority={priority}
        className={styles.image}
      />
    </figure>
  );
}
