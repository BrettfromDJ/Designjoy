import type { Metadata } from "next";
import { adminConfigured, isAdmin } from "@/lib/auth";
import { getHighlights } from "@/lib/highlights";
import { blobConfigured } from "@/lib/store";
import { HighlightsEditor } from "@/components/admin/HighlightsEditor";
import { LoginForm } from "@/components/admin/LoginForm";
import styles from "@/components/admin/Admin.module.css";

export const metadata: Metadata = {
  title: "Highlights — Designjoy admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function HighlightsPage() {
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

  return (
    <main>
      <HighlightsEditor initial={await getHighlights()} storageReady={blobConfigured()} />
    </main>
  );
}
