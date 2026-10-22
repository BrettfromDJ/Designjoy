"use client";

import { useRef, type CSSProperties } from "react";
import { plans, type Plan } from "@/content/site";
import styles from "./MemberCard.module.css";

/**
 * The Designjoy membership card (the welcome page's, dressed for the
 * homepage): black, tilting toward the pointer with its light following,
 * Pro in a holographic foil. A new plan flips it over.
 */
export function MemberCard({
  planId = plans[0].id,
  status,
  className = "",
  style,
}: {
  planId?: Plan["id"];
  /** A status shown in the corner (e.g. "Active", "Paused"). */
  status?: string;
  className?: string;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const plan = plans.find((p) => p.id === planId) ?? plans[0];

  function tilt(event: React.PointerEvent) {
    const el = ref.current;
    if (!el || event.pointerType !== "mouse") return;
    const box = el.getBoundingClientRect();
    const x = (event.clientX - box.left) / box.width - 0.5;
    const y = (event.clientY - box.top) / box.height - 0.5;
    el.style.setProperty("--rx", `${-y * 12}deg`);
    el.style.setProperty("--ry", `${x * 16}deg`);
    el.style.setProperty("--gx", `${(x + 0.5) * 100}%`);
    el.style.setProperty("--gy", `${(y + 0.5) * 100}%`);
  }

  return (
    <div
      className={`${styles.wrap} ${className}`}
      style={style}
      onPointerMove={tilt}
      onPointerLeave={() => ref.current?.removeAttribute("style")}
    >
      <div ref={ref} className={styles.tilt}>
        <div key={plan.id} className={styles.card} data-plan={plan.id}>
          <div className={styles.top}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icons/smile.svg" alt="" width={40} height={40} className={styles.smile} draggable={false} />
            <span className={styles.label}>
              {status ? (
                <span className={styles.status} data-status={status.toLowerCase()}>
                  <span className={styles.dot} aria-hidden="true" />
                  {status}
                </span>
              ) : (
                "Membership"
              )}
            </span>
          </div>
          <div>
            <p className={styles.label}>Designjoy</p>
            <p className={styles.plan}>{plan.name}</p>
          </div>
          <div className={styles.foot}>
            <span>
              <span className={styles.label}>Price</span>
              {plan.price}/mo
            </span>
            <span>
              <span className={styles.label}>Requests</span>
              Unlimited
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Monthly Club or Pro, as a pill switch. */
export function PlanSwitch({
  planId,
  onChange,
  className = "",
}: {
  planId: Plan["id"];
  onChange: (id: Plan["id"]) => void;
  className?: string;
}) {
  return (
    <div className={`${styles.switch} ${className}`} role="radiogroup" aria-label="Plan">
      <span
        className={styles.thumb}
        style={{ "--at": plans.findIndex((p) => p.id === planId) } as CSSProperties}
        aria-hidden="true"
      />
      {plans.map((p) => (
        <button
          key={p.id}
          type="button"
          role="radio"
          aria-checked={p.id === planId}
          className={styles.option}
          onClick={() => onChange(p.id)}
        >
          {p.name}
        </button>
      ))}
    </div>
  );
}
