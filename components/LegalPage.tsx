import Link from "next/link";
import { LEGAL, type LegalDoc } from "@/content/legal";
import styles from "./LegalPage.module.css";

/** A legal document (privacy policy, terms) in the site's narrow reading column. */
export function LegalPage({
  doc,
  other,
}: {
  doc: LegalDoc;
  other: { label: string; href: string };
}) {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <p className={styles.label}>Legal</p>
        <h1 className={styles.title}>{doc.title}</h1>
        <p className={styles.updated}>Last updated {LEGAL.updated}</p>
      </header>

      <article className={styles.card}>
        <p className={styles.intro}>{doc.intro}</p>
        {doc.sections.map((section) => (
          <section key={section.heading} className={styles.section}>
            <h2>{section.heading}</h2>
            {section.body.map((block, i) =>
              Array.isArray(block) ? (
                <ul key={i}>
                  {block.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p key={i}>{block}</p>
              ),
            )}
          </section>
        ))}
      </article>

      <p className={styles.more}>
        See also our <Link href={other.href}>{other.label}</Link>.
      </p>
    </main>
  );
}
