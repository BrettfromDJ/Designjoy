import type { Metadata } from "next";
import { adminConfigured, isAdmin } from "@/lib/auth";
import { blobConfigured, getProjects } from "@/lib/projects";
import { LoginForm } from "@/components/admin/LoginForm";
import { ProjectManager } from "@/components/admin/ProjectManager";
import styles from "@/components/admin/Admin.module.css";

export const metadata: Metadata = {
  title: "Projects — Designjoy admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!adminConfigured()) {
    return (
      <main className={styles.center}>
        <p className={styles.notice}>
          Set <code>ADMIN_PASSWORD</code> in the environment to turn on the project portal.
        </p>
      </main>
    );
  }

  if (!(await isAdmin())) {
    return (
      <main className={styles.center}>
        <LoginForm />
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <ProjectManager initialProjects={await getProjects()} storageReady={blobConfigured()} />
    </main>
  );
}
