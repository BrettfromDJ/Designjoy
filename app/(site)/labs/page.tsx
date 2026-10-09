import Link from "next/link";
import { labTools } from "@/content/labs";
import styles from "./labs.module.css";

export const metadata = {
  title: "Labs — Designjoy",
  description: "Small, free tools from Designjoy.",
};

export default function Labs() {
  return (
    <main className={`${styles.page} ${styles.narrow}`}>
      <header className={styles.header}>
        <p className={styles.label}>Designjoy Labs</p>
        <h1 className={styles.title}>Small tools we use every day.</h1>
        <p className={styles.subtitle}>Free, simple and they run in your browser. Your files never leave your computer.</p>
      </header>
      <ul className={styles.tools}>
        {labTools.map((tool) => (
          <li key={tool.slug}>
            <Link href={`/labs/${tool.slug}`} className={styles.tool}>
              <span>
                <p className={styles.toolName}>{tool.name}</p>
                <p className={styles.toolDescription}>{tool.description}</p>
              </span>
              <span className={styles.arrow} aria-hidden="true">
                →
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
