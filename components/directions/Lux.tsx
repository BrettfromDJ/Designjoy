"use client";

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { plans, testimonials, type Faq, type Plan, type WorkItem } from "@/content/site";
import { openAskBox } from "@/lib/ask-box";
import { startCheckout } from "@/lib/checkout";
import { CheckIcon, PlusIcon } from "../Icons";
import { plain } from "../prototypes/data";
import { WorkCard } from "../WorkCard";
import { ForceTheme, Reveal, useScrollProgress } from "./kit";
import styles from "./Lux.module.css";

/** The four takes on Vault: the card's material and the light around it. */
export type Look = "obsidian" | "titanium" | "gold" | "noir";

const PERKS = ["~48h average delivery", "Unlimited revisions", "Unlimited brands", "Pause or cancel anytime"];

/** The membership card, front and back, turned by the CSS variables it inherits. */
function LuxCard({ plan, className = "" }: { plan: Plan; className?: string }) {
  return (
    <div className={`${styles.scene} ${className}`}>
      <div className={styles.card3d}>
        <div className={`${styles.face} ${styles.front}`} data-plan={plan.id}>
          <span className={styles.material} aria-hidden="true" />
          <span className={styles.glare} aria-hidden="true" />
          <div className={styles.faceTop}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icons/smile.svg" alt="" className={styles.smile} draggable={false} />
            <span className={styles.chip} aria-hidden="true" />
          </div>
          <div className={styles.faceMid}>
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
          <span className={styles.material} aria-hidden="true" />
          <span className={styles.glare} aria-hidden="true" />
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

/** Specks of light drifting up through the stage (dust in a beam, or gold). */
function Dust({ look }: { look: Look }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const gold = look === "gold";
    const count = gold ? 70 : 90;
    let w = 0;
    let h = 0;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const size = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    size();
    const specks = Array.from({ length: count }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * (gold ? 1.6 : 1.2) + 0.3,
      v: Math.random() * 0.00025 + 0.00008,
      sway: Math.random() * Math.PI * 2,
      tw: Math.random() * Math.PI * 2,
    }));
    let frame = 0;
    let visible = true;
    const observer = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    observer.observe(canvas);
    const draw = (t: number) => {
      frame = requestAnimationFrame(draw);
      if (!visible) return;
      ctx.clearRect(0, 0, w, h);
      for (const s of specks) {
        s.y -= s.v;
        if (s.y < -0.02) {
          s.y = 1.02;
          s.x = Math.random();
        }
        const x = (s.x + Math.sin(t / 3000 + s.sway) * 0.01) * w;
        const y = s.y * h;
        // In the obsidian beam, specks show only inside the cone of light.
        const inBeam = look === "obsidian" ? Math.max(0, 1 - Math.abs(x / w - 0.5) / (0.12 + s.y * 0.3)) : 1;
        const twinkle = gold ? 0.35 + 0.65 * Math.abs(Math.sin(t / 700 + s.tw)) : 0.6;
        const alpha = twinkle * inBeam * (look === "noir" ? 0.35 : 0.8);
        if (alpha <= 0.01) continue;
        ctx.beginPath();
        ctx.arc(x, y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = gold ? `rgba(240, 205, 130, ${alpha})` : `rgba(255, 255, 255, ${alpha})`;
        ctx.fill();
      }
    };
    frame = requestAnimationFrame(draw);
    window.addEventListener("resize", size);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", size);
    };
  }, [look]);
  return <canvas ref={ref} className={styles.dust} aria-hidden="true" />;
}

const clamp = (v: number) => Math.min(1, Math.max(0, v));
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

/**
 * The opening and the unveiling in one pinned stage: the card floats under
 * the headline, then as you scroll it comes forward, turns to its back,
 * turns again to Pro and steps aside. It eases toward where the scroll
 * says (so it glides rather than jumps) and leans toward the pointer.
 */
function Stage({ look }: { look: Look }) {
  const ref = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const target = useRef(0);
  const pointer = useRef({ x: 0, y: 0 });
  const [phase, setPhase] = useState(0);

  useScrollProgress(ref, (p) => {
    target.current = p;
    setPhase(p < 0.14 ? 0 : p < 0.36 ? 1 : p < 0.66 ? 2 : 3);
  });

  // Where the card rests under the headline before it comes forward: smaller
  // with the letterbox closed.
  const rest = look === "noir" ? { s: 0.5, y: 2 } : { s: 0.58, y: 3.5 };

  useEffect(() => {
    const pin = pinRef.current;
    if (!pin) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const now = { p: target.current, px: 0, py: 0 };
    let frame = 0;
    const tick = (t: number) => {
      frame = requestAnimationFrame(tick);
      const k = still ? 1 : 0.085;
      now.p += (target.current - now.p) * k;
      now.px += (pointer.current.x - now.px) * 0.08;
      now.py += (pointer.current.y - now.py) * 0.08;
      const p = now.p;
      const come = ease(clamp((p - 0.06) / 0.22));
      const flip1 = ease(clamp((p - 0.38) / 0.16));
      const flip2 = ease(clamp((p - 0.66) / 0.16));
      const leave = ease(clamp((p - 0.88) / 0.12));
      const idle = still ? 0 : Math.sin(t / 1800) * (1 - come);
      pin.style.setProperty("--rx", `${(1 - come) * 16 + now.py * -9}deg`);
      pin.style.setProperty("--ry", `${(flip1 + flip2) * 180 + (1 - come) * -22 + idle * 7 + now.px * 12}deg`);
      pin.style.setProperty("--rz", `${(1 - come) * 4}deg`);
      pin.style.setProperty("--s", `${rest.s + come * (1 - rest.s) - leave * 0.12}`);
      pin.style.setProperty("--ty", `${(1 - come) * rest.y - leave * 6 + idle * 1.2}vh`);
      pin.style.setProperty("--head", `${clamp(p / 0.12)}`);
      pin.style.setProperty("--open", `${come}`);
      pin.style.setProperty("--gx", `${50 + now.px * 60}%`);
      pin.style.setProperty("--gy", `${30 + now.py * 60}%`);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [rest.s, rest.y]);

  function lean(event: React.PointerEvent) {
    if (event.pointerType !== "mouse") return;
    pointer.current = {
      x: event.clientX / window.innerWidth - 0.5,
      y: event.clientY / window.innerHeight - 0.5,
    };
  }

  // The front turns to Pro while the back is showing.
  const plan = phase === 3 ? plans[1] : plans[0];

  return (
    <section ref={ref} className={styles.stage} data-phase={phase} onPointerMove={lean}>
      <div ref={pinRef} className={styles.pin}>
        <div className={styles.atmosphere} aria-hidden="true">
          <span className={styles.beam} />
          <span className={styles.smokeA} />
          <span className={styles.smokeB} />
          <span className={styles.floor} />
        </div>
        {(look === "obsidian" || look === "gold" || look === "noir") && <Dust look={look} />}
        {look === "noir" && (
          <>
            <span className={`${styles.bar} ${styles.barTop}`} aria-hidden="true" />
            <span className={`${styles.bar} ${styles.barBottom}`} aria-hidden="true" />
          </>
        )}

        <div className={styles.head}>
          <p className={styles.rule}>
            <span>Designjoy</span>
            <span>Membership</span>
            <span>Design, on subscription</span>
          </p>
          <h1 className={styles.h1}>
            <span className={styles.line}>One card.</span>
            <span className={styles.line}>
              <em>Unlimited design.</em>
            </span>
          </h1>
        </div>

        <div className={styles.cardSpot}>
          <LuxCard plan={plan} className={styles.stageCard} />
          {look === "obsidian" && (
            <div className={styles.reflection} aria-hidden="true">
              <LuxCard plan={plan} />
            </div>
          )}
        </div>

        <div className={styles.foot}>
          <p className={styles.lede}>
            A senior design team on one membership. Most requests land in about 48 hours.
          </p>
          <div className={styles.buttons}>
            <button type="button" className={styles.primary} onClick={() => startCheckout(plans[0].id)}>
              Request your card
            </button>
            <button type="button" className={styles.ghost} onClick={() => openAskBox("booking")}>
              Book a call
            </button>
          </div>
        </div>

        <div className={styles.captions}>
          <div className={styles.caption} data-for="1">
            <p className={styles.kicker}>The card</p>
            <p className={styles.capText}>One flat fee for a senior design team, on call.</p>
          </div>
          <div className={styles.caption} data-for="2">
            <p className={styles.kicker}>On the back</p>
            <p className={styles.capText}>Unlimited requests and revisions, most delivered in about two days.</p>
          </div>
          <div className={styles.caption} data-for="3">
            <p className={styles.kicker}>Moving faster?</p>
            <p className={styles.capText}>Pro adds daily updates and a direct line on Slack.</p>
          </div>
        </div>
        <div className={`${styles.captions} ${styles.right}`}>
          <div className={styles.caption} data-for="1">
            <p className={styles.price}>{plans[0].price}</p>
            <p className={styles.kicker}>Monthly Club, per month</p>
          </div>
          <div className={styles.caption} data-for="2">
            <p className={styles.price}>0</p>
            <p className={styles.kicker}>Contracts. Pause or cancel anytime.</p>
          </div>
          <div className={styles.caption} data-for="3">
            <p className={styles.price}>{plans[1].price}</p>
            <p className={styles.kicker}>Pro, per month</p>
          </div>
        </div>
        <span className={styles.scrollHint} aria-hidden="true">
          Scroll
        </span>
      </div>
    </section>
  );
}

/** The work, gliding past sideways as the page scrolls down. */
function Collection({ work }: { work: WorkItem[] }) {
  const ref = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const section = ref.current;
    const track = trackRef.current;
    if (!section || !track) return;
    const size = () => section.style.setProperty("--travel", `${Math.max(0, track.scrollWidth - window.innerWidth)}px`);
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
                <b>{item.company ?? "Designjoy"}</b>
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
 * Vault, in four looks (`look`): the same story (the card unveiled as you
 * scroll, the collection, the ritual, the two cards, kind words and
 * questions), with the card's material and the light around it changed.
 */
export function Lux({ work, faqs, look }: { work: WorkItem[]; faqs: Faq[]; look: Look }) {
  return (
    <main className={styles.page} data-look={look}>
      <ForceTheme theme="dark" />
      <span className={styles.grain} aria-hidden="true" />

      <Stage look={look} />
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
            <Reveal key={p.id} delay={i * 140} className={styles.tier}>
              <LuxCard plan={p} className={styles.tierCard} />
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
        <div className={styles.closeLight} aria-hidden="true" />
        <LuxCard plan={plans[0]} className={styles.spinning} />
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
