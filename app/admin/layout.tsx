import { isAdmin } from "@/lib/auth";
import { AdminNav } from "@/components/admin/AdminNav";
import styles from "@/components/admin/Admin.module.css";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!(await isAdmin())) return children;
  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <AdminNav />
        {children}
      </div>
    </div>
  );
}
