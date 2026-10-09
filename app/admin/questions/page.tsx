import type { Metadata } from "next";
import { adminConfigured, isAdmin } from "@/lib/auth";
import { getQuestions } from "@/lib/questions";
import { blobConfigured } from "@/lib/store";
import { LoginForm } from "@/components/admin/LoginForm";
import { QuestionLog } from "@/components/admin/QuestionLog";
import styles from "@/components/admin/Admin.module.css";

export const metadata: Metadata = {
  title: "Questions — Designjoy admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function QuestionsPage() {
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

  const { questions, total } = await getQuestions();
  return (
    <main>
      <QuestionLog questions={questions} total={total} storageReady={blobConfigured()} />
    </main>
  );
}
