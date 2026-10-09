import Link from "next/link";
import { SequenceTool } from "@/components/labs/SequenceTool";
import styles from "../labs.module.css";

export const metadata = {
  title: "Sequence — Designjoy Labs",
  description: "Turn a stack of images into a looping GIF, right in your browser.",
};

export default function Sequence() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <p className={styles.label}>
          <Link href="/labs">Designjoy Labs</Link>
        </p>
        <h1 className={styles.title}>Sequence</h1>
        <p className={styles.subtitle}>Drop in your images, set the speed and download a GIF.</p>
      </header>
      <SequenceTool />
    </main>
  );
}
