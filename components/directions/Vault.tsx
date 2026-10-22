"use client";

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { plans, testimonials, type Faq, type Plan, type WorkItem } from "@/content/site";
import { openAskBox } from "@/lib/ask-box";
import { startCheckout } from "@/lib/checkout";
import { CheckIcon, PlusIcon } from "../Icons";
import { plain } from "../prototypes/data";
import { WorkCard } from "../WorkCard";
import { ForceTheme, Reveal, useScrollProgress } from "./kit";
import styles from "./Vault.module.css";

const PERKS = ["~48h average delivery", "Unlimited revisions", "Unlimited brands", "Pause or cancel anytime"];

/** The membership card with a front and a back, turned by --rx / --ry / --s. */
function VaultCard({ plan, className = "", style }: { plan: Plan; className?: string; style?: CSSProperties }) {
  return (
    <div className={`${styles.scene} ${className}`} style={style}>
      <div className={styles.card3d}>
        <div className={`${styles.face} ${styles.front}`} data-plan={plan.id}>
          <div className={styles.faceTop}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icons/smile.svg" alt="" className={styles.smile} draggable={false} />
            <span className={styles.chip} aria-hidden="true" />
          </div>
          <div>
            <p className={styles.small}>Designjoy</p>
            <p className={styles.planName}>{plan.name}</p>
          </div>
          <div className={styles.faceFoot}>
            <span>
              <span className={styles.small}>Member</span>
              Your company
            </span>
            <span>
              <span className={styles.small}>Requests</span>
              Unlimited
            </span>
          </div>
        </div>
        <div className={`${styles.face} ${styles.back}`}>
          <span className={styles.stripe} aria-hidden="true" />
          <div className={styles.signature}>
            <em>Unlimited requests</em>
            <span>{plan.price}/mo</span>
          </div>
          <ul className={styles.backPerks}>
            {PERKS.map((perk) => (
              <li key={perk}>{perk}</li>
            ))}
          </ul>
          <span className={styles.holo} aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}

/** The card's turns as the pinned section scrolls: rising, flipping, flipping again to Pro. */
const clamp = (v: number) => Math.min(1, Math.max(0, v));
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

function Unveil() {
  const ref = useRef<HTMLElement>(null);
  // The card's turn is set on the pinned frame, as CSS variables it inherits.
  const pinRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState(0);

  useScrollProgress(ref, (p) => {
    const rise = ease(clamp(p / 0.22));
    const flip1 = ease(clamp((p - 0.3) / 0.16));
    const flip2 = ease(clamp((p - 0.62) / 0.16));
    const el = pinRef.current;
    if (el) {
      el.style.setProperty("--rx", `${(1 - rise) * 62}deg`);
      el.style.setProperty("--ry", `${(flip1 + flip2) * 180 - (1 - rise) * 8}deg`);
      el.style.setProperty("--rz", `${(1 - rise) * -14}deg`);
      el.style.setProperty("--s", `${0.78 + rise * 0.22}`);
    }
    setPhase(p < 0.36 ? 0 : p < 0.68 ? 1 : 2);
  });

  // The front changes to Pro while the back is showing.
  const plan = phase === 2 ? plans[1] : plans[0];

  return (
    <section ref={ref} className={styles.unveil} data-phase={phase}>
      <div ref={pinRef} className={styles.pin}>
        <div className={styles.captions}>
          <div className={styles.caption} data-for="0">
            <p className={styles.kicker}>The card</p>
            <p className={styles.capText}>One flat fee for a senior design team, on call.</p>
          </div>
          <div className={styles.caption} data-for="1">
            <p className={styles.kicker}>On the back</p>
            <p className={styles.capText}>Unlimited requests, unlimited revisions, delivered in about two days.</p>
          </div>
          <div className={styles.caption} data-for="2">
            <p className={styles.kicker}>Moving faster?</p>
            <p className={styles.capText}>Pro adds daily updates and a direct line on Slack.</p>
          </div>
        </div>
        <VaultCard plan={plan} className={styles.unveilCard} />
        <div className={`${styles.captions} ${styles.right}`}>
          <div className={styles.caption} data-for="0">
            <p className={styles.price}>{plans[0].price}</p>
            <p className={styles.kicker}>Monthly Club, per month</p>
          </div>
          <div className={styles.caption} data-for="1">
            <p className={styles.price}>0</p>
            <p className={styles.kicker}>Contracts. Pause or cancel anytime.</p>
          </div>
          <div className={styles.caption} data-for="2">
            <p className={styles.price}>{plans[1].price}</p>
            <p className={styles.kicker}>Pro, per month</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/** The work, gliding past sideways as the page scrolls down. */
function Collection({ work }: { work: WorkItem[] }) {
  const ref = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  // Tall enough to scroll the whole track past.
  useLayoutEffect(() => {
    const section = ref.current;
    const track = trackRef.current;
    if (!section || !track) return;
    const size = () => {
      const travel = Math.max(0, track.scrollWidth - window.innerWidth);
      section.style.setProperty("--travel", `${travel}px`);
    };
    size();
    const observer = new ResizeObserver(size);
    observer.observe(track);
    window.addEventListener("resize", size);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", size);
    };
  }, []);
  useScrollProgress(ref);

  return (
    <section ref={ref} className={styles.collection}>
      <div className={styles.collectionPin}>
        <header className={styles.collectionHead}>
          <h2 className={styles.h2}>
            The <em>collection</em>
          </h2>
          <p className={styles.kicker}>{String(work.length).padStart(2, "0")} pieces, all made on membership</p>
        </header>
        <div ref={trackRef} className={styles.track}>
          {work.map((item, i) => (
            <figure key={item.id} className={styles.piece} style={{ "--ratio": item.width / item.height } as CSSProperties}>
              <WorkCard item={item} order={i} sizes="(min-width: 900px) 70vw, 88vw" />
              <figcaption>
                <span>{String(i + 1).padStart(2, "0")}</span>
                <em>{item.company ?? "Designjoy"}</em>
                {item.title}
              </figcaption>
            </figure>
          ))}
        </div>
        <div className={styles.progress} aria-hidden="true">
          <span />
        </div>
      </div>
    </section>
  );
}

/** One quote at a time, turning over. */
function Quotes() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setI((n) => (n + 1) % testimonials.length), 5200);
    return () => clearInterval(timer);
  }, []);
  const t = testimonials[i];
  return (
    <section className={styles.quotes}>
      <p className={styles.kicker}>Said about us</p>
      <blockquote key={i} className={styles.quote}>
        “{t.quote}”
      </blockquote>
      <p key={`by-${i}`} className={styles.by}>
        {t.name ?? t.company}
        {t.role && <span> · {t.role}</span>}
      </p>
    </section>
  );
}

/**
 * Direction 1, "Vault": black-card luxury. The membership card rises and
 * turns in 3D as you scroll, showing the perks on its back and turning
 * over to Pro; the work glides past sideways like a private collection;
 * then the ritual, the two cards, kind words and questions.
 */
export function Vault({ work, faqs }: { work: WorkItem[]; faqs: Faq[] }) {
  const [planId, setPlanId] = useState<Plan["id"]>(plans[0].id);

  return (
    <main className={styles.page}>
      <ForceTheme theme="dark" />

      {/* ---------- Hero ---------- */}
      <section className={styles.hero}>
        <div className={styles.rule}>
          <span>Designjoy</span>
          <span>Membership</span>
          <span>Design, on subscription</span>
        </div>
        <h1 className={styles.h1}>
          <Reveal kind="mask" as="span">
            One card.
          </Reveal>
          <Reveal kind="mask" as="span" delay={120}>
            <em>Unlimited design.</em>
          </Reveal>
        </h1>
        <Reveal kind="blur" delay={300} className={styles.heroFoot}>
          <p className={styles.lede}>
            A senior design team on a single membership. Logos, websites, apps and decks, most delivered in about 48
            hours.
          </p>
          <div className={styles.buttons}>
            <button type="button" className={styles.primary} onClick={() => startCheckout(plans[0].id)}>
              Request your card
            </button>
            <button type="button" className={styles.ghost} onClick={() => openAskBox("booking")}>
              Book a call
            </button>
          </div>
        </Reveal>
        <span className={styles.scrollHint} aria-hidden="true">
          Scroll
        </span>
      </section>

      <Unveil />
      <Collection work={work} />

      {/* ---------- The ritual ---------- */}
      <section className={styles.section}>
        <Reveal kind="mask" as="h2" className={styles.h2}>
          The <em>ritual</em>
        </Reveal>
        <ol className={styles.ritual}>
          {[
            ["Subscribe", "Choose your card. Your private Trello board arrives within a few hours."],
            ["Request", "Add as many requests as you like. We take them one at a time, in your order."],
            ["Receive", "Most land in about 48 hours. Revise until it's right, then the next begins."],
          ].map(([title, body], i) => (
            <Reveal as="li" key={title} delay={i * 120}>
              <span className={styles.numeral}>{["I", "II", "III"][i]}</span>
              <h3>{title}</h3>
              <p>{body}</p>
            </Reveal>
          ))}
        </ol>
      </section>

      {/* ---------- The two cards ---------- */}
      <section className={styles.section}>
        <Reveal kind="mask" as="h2" className={styles.h2}>
          Choose your <em>card</em>
        </Reveal>
        <div className={styles.tiers}>
          {plans.map((p, i) => (
            <Reveal
              key={p.id}
              delay={i * 140}
              className={styles.tier}
              style={{ "--on": p.id === planId ? 1 : 0 } as CSSProperties}
            >
              <div onPointerEnter={() => setPlanId(p.id)}>
                <VaultCard plan={p} className={styles.tierCard} />
              </div>
              <div className={styles.tierInfo}>
                <p className={styles.tierPrice}>
                  {p.price}
                  <span>/mo</span>
                </p>
                <p className={styles.kicker}>{p.description}</p>
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
                  className={p.highlight ? styles.primary : styles.ghost}
                  onClick={() => startCheckout(p.id)}
                >
                  Join {p.name}
                </button>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <Quotes />

      {/* ---------- Questions ---------- */}
      <section className={styles.section}>
        <Reveal kind="mask" as="h2" className={styles.h2}>
          Questions, <em>answered</em>
        </Reveal>
        <div className={styles.faqs}>
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
        <VaultCard plan={plans[0]} className={styles.spinning} />
        <h2 className={styles.h1}>
          <Reveal kind="mask" as="span">
            Your card
          </Reveal>
          <Reveal kind="mask" as="span" delay={120}>
            <em>is waiting.</em>
          </Reveal>
        </h2>
        <div className={styles.buttons}>
          <button type="button" className={styles.primary} onClick={() => startCheckout(plans[0].id)}>
            Request your card
          </button>
          <button type="button" className={styles.ghost} onClick={() => openAskBox("chat")}>
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
