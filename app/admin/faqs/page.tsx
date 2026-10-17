import type { Metadata } from "next";
import { adminConfigured, isAdmin } from "@/lib/auth";
import { getFaqs } from "@/lib/faqs";
import { blobConfigured } from "@/lib/store";
import { FaqsEditor } from "@/components/admin/FaqsEditor";
import { LoginForm } from "@/components/admin/LoginForm";
import styles from "@/components/admin/Admin.module.css";

export const metadata: Metadata = {
  title: "FAQs — Designjoy admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function FaqsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; a?: string }>;
}) {
  if (!adminConfigured() || !(await isAdmin())) {
    return (
      <main className={styles.center}>
        {adminConfigured() ? (
          <LoginForm />
        ) : (
          <p className={styles.notice}>
            Set <code>ADMIN_PASSWORD</code> in the environment to turn on the admin portal.
          </p>
        )}
      </main>
    );
  }

  // ?q= and ?a= start a new FAQ, e.g. from a question in the log.
  const { q, a } = await searchParams;
  const { faqs } = await getFaqs();
  return (
    <main>
      <FaqsEditor
        initial={faqs}
        draft={q ? { question: q, answer: a ?? "" } : undefined}
        storageReady={blobConfigured()}
      />
    </main>
  );
}
