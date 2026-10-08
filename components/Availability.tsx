import { availability } from "@/content/site";
import styles from "./Availability.module.css";

/** "Spots available today" banner at the top of the pricing cards. */
export function Availability() {
  if (!availability) return null;
  return (
    <p className={styles.banner}>
      <i className={styles.dot} aria-hidden="true" />
      {availability}
    </p>
  );
}
