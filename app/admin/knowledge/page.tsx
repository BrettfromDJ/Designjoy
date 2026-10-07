import type { Metadata } from "next";
import { adminConfigured, isAdmin } from "@/lib/auth";
import { getKnowledge } from "@/lib/knowledge";
import { blobConfigured } from "@/lib/store";
import { KnowledgeEditor } from "@/components/admin/KnowledgeEditor";
import { LoginForm } from "@/components/admin/LoginForm";
import styles from "@/components/admin/Admin.module.css";

export const metadata: Metadata = {
  title: "Chatbot — Designjoy admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function KnowledgePage() {
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

  const { text, source } = await getKnowledge();
  return (
    <main>
      <KnowledgeEditor initialText={text} source={source} storageReady={blobConfigured()} />
    </main>
  );
}
