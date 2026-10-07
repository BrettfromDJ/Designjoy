"use client";

import { useActionState } from "react";
import { login } from "@/app/admin/actions";
import styles from "./Admin.module.css";

export function LoginForm() {
  const [error, action, pending] = useActionState(login, null);

  return (
    <form action={action} className={styles.login}>
      <h1 className={styles.title}>Designjoy admin</h1>
      <label htmlFor="password" className={styles.label}>
        Password
      </label>
      <input
        id="password"
        name="password"
        type="password"
        autoComplete="current-password"
        required
        autoFocus
        className={styles.field}
      />
      <button type="submit" className={styles.primary} disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </button>
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
