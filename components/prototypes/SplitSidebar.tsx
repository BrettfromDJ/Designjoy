"use client";

import { useEffect, useState } from "react";
import { plans, scopeOfWork, testimonials, type Faq, type Plan } from "@/content/site";
import { openAskBox } from "@/lib/ask-box";
import { startCheckout } from "@/lib/checkout";
import { CheckIcon, PlusIcon } from "../Icons";
import { plain } from "./data";
import { MemberCard, PlanSwitch } from "./MemberCard";
import styles from "./SplitSidebar.module.css";

/**
 * Prototype 2, "Split": today's layout, with the left column cut down to two
 * things: the membership card (pick a plan, join), and everything else as
 * short tabs, one open at a time, so it reads in a glance instead of a
 * long scroll. The work fills the rest of the screen as now.
 */
export function SplitSidebar({ faqs }: { faqs: Faq[] }) {
  const [planId, setPlanId] = useState<Plan["id"]>(plans[0].id);
  const plan = plans.find((p) => p.id === planId) ?? plans[0];
  const [open, setOpen] = useState("how");

  // The nav sits at the top of the column on wider screens, as on the homepage.
  useEffect(() => {
    document.body.dataset.sidebar = "";
    return () => {
      delete document.body.dataset.sidebar;
    };
  }, []);

  const sections = [
    {
      id: "how",
      title: "How it works",
      body: (
        <ol className={styles.steps}>
          <li>
            <b>Subscribe.</b> Your Trello board arrives within a few hours.
          </li>
          <li>
            <b>Request.</b> Add as many as you like; we take them one at a time.
          </li>
          <li>
            <b>Receive.</b> Most land in about 48 hours. Revise until it&apos;s right.
          </li>
        </ol>
      ),
    },
    {
      id: "included",
      title: `What's in ${plan.name}`,
      body: (
        <ul className={styles.features}>
          {plan.features.map((feature, i) => (
            <li key={feature}>
              {plan.additions && i > 0 ? <PlusIcon /> : <CheckIcon />}
              {feature}
            </li>
          ))}
        </ul>
      ),
    },
    {
      id: "scope",
      title: "What we design",
      body: (
        <ul className={styles.chips}>
          {scopeOfWork.map((service) => (
            <li key={service}>{service}</li>
          ))}
        </ul>
      ),
    },
    {
      id: "words",
      title: "Kind words",
      body: (
        <div className={styles.quotes}>
          {testimonials.map((t) => (
            <figure key={t.quote}>
              <blockquote>“{t.quote}”</blockquote>
              <figcaption>
                {t.name ?? t.company}
                {t.role && ` · ${t.role}`}
              </figcaption>
            </figure>
          ))}
        </div>
      ),
    },
    {
      id: "faqs",
      title: "Questions",
      body: (
        <div className={styles.faqs}>
          {faqs.slice(0, 5).map((faq) => (
            <details key={faq.question}>
              <summary>{faq.question}</summary>
              <p>{plain(faq.answer)}</p>
            </details>
          ))}
          <button type="button" className={styles.link} onClick={() => openAskBox("chat")}>
            Ask anything else <span aria-hidden="true">→</span>
          </button>
        </div>
      ),
    },
  ];

  return (
    <aside className={styles.sidebar} aria-label="About Designjoy">
      <div className={styles.inner}>
        <h1 className="visually-hidden">Designjoy: design, on subscription</h1>

        <section className={styles.panel}>
          <MemberCard planId={planId} />
          <PlanSwitch planId={planId} onChange={setPlanId} className={styles.switch} />
          <p className={styles.pitch}>
            Unlimited design requests for {plan.price}/mo. Most land in about 48 hours.{" "}
            <span className={styles.muted}>Pause or cancel anytime.</span>
          </p>
          <button type="button" className={styles.primary} onClick={() => startCheckout(plan.id)}>
            Join {plan.name}
          </button>
          <button type="button" className={styles.link} onClick={() => openAskBox("booking")}>
            Book a 15 min intro call <span aria-hidden="true">→</span>
          </button>
        </section>

        <section className={`${styles.panel} ${styles.tabs}`}>
          {sections.map((s) => (
            <div key={s.id} className={styles.tab} data-open={open === s.id || undefined}>
              <button
                type="button"
                className={styles.tabHead}
                aria-expanded={open === s.id}
                onClick={() => setOpen(open === s.id ? "" : s.id)}
              >
                {s.title}
                <span className={styles.plus} aria-hidden="true" />
              </button>
              <div className={styles.tabBody}>
                <div>{s.body}</div>
              </div>
            </div>
          ))}
        </section>

        <footer className={styles.legal}>
          <span>© {new Date().getFullYear()} Designjoy</span>
          <a href="/terms">Terms</a>
          <a href="/privacy">Privacy</a>
        </footer>
      </div>
    </aside>
  );
}
