"use client";

import { useRef, useState, type CSSProperties } from "react";
import { plans, testimonials, type Faq, type Plan, type WorkItem } from "@/content/site";
import { openAskBox } from "@/lib/ask-box";
import { startCheckout } from "@/lib/checkout";
import { CheckIcon, PlusIcon } from "../Icons";
import { plain } from "../prototypes/data";
import { WorkCard } from "../WorkCard";
import { CountUp, ForceTheme, Reveal } from "./kit";
import styles from "./Aurora.module.css";

/** The membership card in frosted glass, the aurora showing through, tilting to the pointer. */
function GlassCard({ plan, className = "" }: { plan: Plan; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  function tilt(event: React.PointerEvent) {
    const el = ref.current;
    if (!el || event.pointerType !== "mouse") return;
    const box = el.getBoundingClientRect();
    const x = (event.clientX - box.left) / box.width - 0.5;
    const y = (event.clientY - box.top) / box.height - 0.5;
    el.style.setProperty("--rx", `${-y * 14}deg`);
    el.style.setProperty("--ry", `${x * 18}deg`);
    el.style.setProperty("--gx", `${(x + 0.5) * 100}%`);
    el.style.setProperty("--gy", `${(y + 0.5) * 100}%`);
  }
  return (
    <div className={`${styles.glassWrap} ${className}`} onPointerMove={tilt} onPointerLeave={() => ref.current?.removeAttribute("style")}>
      <div ref={ref} className={styles.glassCard} data-plan={plan.id}>
        <div className={styles.glassTop}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icons/smile.svg" alt="" className={styles.glassSmile} draggable={false} />
          <span className={styles.micro}>Membership</span>
        </div>
        <div>
          <p className={styles.micro}>Designjoy</p>
          <p className={styles.glassPlan}>{plan.name}</p>
        </div>
        <div className={styles.glassFoot}>
          <span>
            <span className={styles.micro}>Price</span>
            {plan.price}/mo
          </span>
          <span>
            <span className={styles.micro}>Requests</span>
            Unlimited
          </span>
        </div>
      </div>
    </div>
  );
}

/** The work on a turning ring; it pauses while hovered and steps with the arrows. */
function Orbit({ work }: { work: WorkItem[] }) {
  const [step, setStep] = useState(0);
  const n = Math.max(work.length, 3);
  return (
    <div className={styles.orbit} style={{ "--n": n, "--step": step } as CSSProperties}>
      <div className={styles.ring}>
        <div className={styles.ringInner}>
          {work.map((item, i) => (
            <div key={item.id} className={styles.slot} style={{ "--i": i } as CSSProperties}>
              <WorkCard item={item} order={i} sizes="(min-width: 900px) 460px, 80vw" />
              <p>
                <b>{item.company ?? "Designjoy"}</b> {item.title}
              </p>
            </div>
          ))}
        </div>
      </div>
      <div className={styles.orbitControls}>
        <button type="button" onClick={() => setStep((s) => s + 1)} aria-label="Previous piece">
          ‹
        </button>
        <button type="button" onClick={() => setStep((s) => s - 1)} aria-label="Next piece">
          ›
        </button>
      </div>
    </div>
  );
}

/**
 * Direction 5, "Aurora": light and glass. A moving aurora behind
 * everything, a frosted glass membership card, the work turning on a 3D
 * ring, steps that light up one after another, glass pricing.
 */
export function Aurora({ work, faqs }: { work: WorkItem[]; faqs: Faq[] }) {
  const heroRef = useRef<HTMLElement>(null);
  const [planId, setPlanId] = useState<Plan["id"]>(plans[0].id);
  const plan = plans.find((p) => p.id === planId) ?? plans[0];

  // A soft light following the pointer across the hero.
  function follow(event: React.PointerEvent) {
    const el = heroRef.current;
    if (!el) return;
    const box = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${event.clientX - box.left}px`);
    el.style.setProperty("--my", `${event.clientY - box.top}px`);
  }

  return (
    <main className={styles.page}>
      <ForceTheme theme="dark" />
      <div className={styles.aurora} aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
      </div>

      {/* ---------- Hero ---------- */}
      <section ref={heroRef} className={styles.hero} onPointerMove={follow}>
        <div className={styles.heroText}>
          <p className={styles.pill}>
            <span className={styles.dot} aria-hidden="true" />
            Spots available · Start today
          </p>
          <h1 className={styles.h1}>
            Design, on <span className={styles.shine}>subscription.</span>
          </h1>
          <p className={styles.lede}>
            One membership, unlimited requests, a senior team. Most designs land in about 48 hours. Pause or cancel
            anytime.
          </p>
          <div className={styles.buttons}>
            <button type="button" className={styles.primary} onClick={() => startCheckout(plan.id)}>
              Join {plan.name}
            </button>
            <button type="button" className={styles.glassButton} onClick={() => openAskBox("booking")}>
              Book a call
            </button>
          </div>
        </div>
        <div className={styles.heroCard}>
          <GlassCard plan={plan} />
          <div className={styles.switch} role="radiogroup" aria-label="Plan">
            {plans.map((p) => (
              <button key={p.id} type="button" role="radio" aria-checked={p.id === planId} onClick={() => setPlanId(p.id)}>
                {p.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Numbers ---------- */}
      <section className={styles.stats}>
        <div>
          <CountUp to={48} suffix="h" className={styles.statNum} />
          <p>Average delivery</p>
        </div>
        <div>
          <span className={styles.statNum}>∞</span>
          <p>Requests and revisions</p>
        </div>
        <div>
          <CountUp to={15} className={styles.statNum} />
          <p>Kinds of design</p>
        </div>
        <div>
          <CountUp to={0} className={styles.statNum} />
          <p>Contracts</p>
        </div>
      </section>

      {/* ---------- The work, on a ring ---------- */}
      <section className={styles.section}>
        <Reveal kind="blur" as="h2" className={styles.h2}>
          The <span className={styles.shine}>work</span>
        </Reveal>
        <p className={styles.sub}>Hover to pause. Use the arrows to turn it.</p>
        <Orbit work={work} />
      </section>

      {/* ---------- Steps that light in turn ---------- */}
      <section className={styles.section}>
        <Reveal kind="blur" as="h2" className={styles.h2}>
          How it <span className={styles.shine}>works</span>
        </Reveal>
        <ol className={styles.steps}>
          {[
            ["Subscribe", "Pick a plan. Your Trello board arrives within a few hours."],
            ["Request", "Add as many requests as you like. We take them one at a time."],
            ["Receive", "Most land in about 48 hours. Revise until it's right."],
          ].map(([title, body], i) => (
            <li key={title} style={{ "--i": i } as CSSProperties}>
              <span className={styles.stepNo}>0{i + 1}</span>
              <h3>{title}</h3>
              <p>{body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ---------- Pricing ---------- */}
      <section className={styles.section}>
        <Reveal kind="blur" as="h2" className={styles.h2}>
          Simple <span className={styles.shine}>pricing</span>
        </Reveal>
        <div className={styles.plans}>
          {plans.map((p, i) => (
            <Reveal key={p.id} kind="up" delay={i * 120} className={styles.plan}>
              <div className={styles.planInner} data-highlight={p.highlight || undefined}>
                <p className={styles.planName}>
                  {p.name}
                  {p.tag && <span>{p.tag}</span>}
                </p>
                <p className={styles.planPrice}>
                  {p.price}
                  <small>/mo</small>
                </p>
                <p className={styles.sub}>{p.description}</p>
                <ul>
                  {p.features.map((f, n) => (
                    <li key={f}>
                      {p.additions && n > 0 ? <PlusIcon /> : <CheckIcon />}
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  className={p.highlight ? styles.primary : styles.glassButton}
                  onClick={() => startCheckout(p.id)}
                >
                  Join {p.name}
                </button>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------- Kind words ---------- */}
      <section className={styles.section}>
        <div className={styles.quotes}>
          {testimonials.map((t, i) => (
            <Reveal key={t.quote} kind="blur" delay={i * 140} className={styles.quote}>
              <p>“{t.quote}”</p>
              <span>
                {t.name ?? t.company}
                {t.role && ` · ${t.role}`}
              </span>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------- Questions ---------- */}
      <section className={styles.section}>
        <Reveal kind="blur" as="h2" className={styles.h2}>
          Questions
        </Reveal>
        <div className={styles.faq}>
          {faqs.map((faq) => (
            <details key={faq.question}>
              <summary>{faq.question}</summary>
              <p>{plain(faq.answer)}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ---------- Close ---------- */}
      <section className={styles.close}>
        <GlassCard plan={plans[1]} className={styles.closeCard} />
        <h2 className={styles.closeTitle}>
          Start your <span className={styles.shine}>membership.</span>
        </h2>
        <div className={styles.buttons}>
          <button type="button" className={styles.primary} onClick={() => startCheckout(plans[0].id)}>
            Join today
          </button>
          <button type="button" className={styles.glassButton} onClick={() => openAskBox("chat")}>
            Ask a question
          </button>
        </div>
      </section>

      <footer className={styles.footer}>
        <span>© {new Date().getFullYear()} Designjoy</span>
        <a href="/terms">Terms</a>
        <a href="/privacy">Privacy</a>
      </footer>
    </main>
  );
}
