"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { plans, scopeOfWork, type Faq, type Plan, type WorkItem } from "@/content/site";
import { openAskBox } from "@/lib/ask-box";
import { startCheckout } from "@/lib/checkout";
import { BoardDemo } from "../BoardDemo";
import { WorkCard } from "../WorkCard";
import { MemberCard, PlanSwitch } from "./MemberCard";
import { CloseSection, FaqSection, Footer, PricingSection, QuotesSection } from "./Story";
import story from "./Story.module.css";
import styles from "./Chapters.module.css";

/** Flips between Active and Paused, to show a membership pausing. */
function PausingCard({ planId }: { planId: Plan["id"] }) {
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    const timer = setInterval(() => setPaused((p) => !p), 2600);
    return () => clearInterval(timer);
  }, []);
  return (
    <div className={styles.pausing} data-paused={paused || undefined}>
      <MemberCard planId={planId} status={paused ? "Paused" : "Active"} />
      <p className={styles.caption}>{paused ? "Paused. Pick it back up whenever you like." : "Active. Requests flowing."}</p>
    </div>
  );
}

/**
 * Prototype 3, "Chapters": the membership told in five beats as you scroll,
 * each pinned beside a big visual (the card, the board, the work), with a
 * rail showing where you are. Then the full body of work, pricing, kind
 * words and questions, as in Story.
 */
export function Chapters({ work, faqs }: { work: WorkItem[]; faqs: Faq[] }) {
  const [planId, setPlanId] = useState<Plan["id"]>(plans[0].id);
  const plan = plans.find((p) => p.id === planId) ?? plans[0];
  const [active, setActive] = useState(-1);
  const refs = useRef<(HTMLElement | null)[]>([]);
  // The opening and the sections after the chapters, where the rail hides.
  const outside = useRef<(HTMLElement | null)[]>([]);

  const chapters: { title: string; lede: ReactNode; body: ReactNode; visual: ReactNode }[] = [
    {
      title: "Join",
      lede: "One membership covers everything.",
      body: (
        <>
          <p>
            {plan.name} is {plan.price} a month. {plan.description} No contracts, no surprise invoices.
          </p>
          <button type="button" className={styles.cta} onClick={() => startCheckout(plan.id)}>
            Join {plan.name}
          </button>
        </>
      ),
      visual: (
        <div className={styles.cardStage}>
          <MemberCard planId={planId} />
          <PlanSwitch planId={planId} onChange={setPlanId} />
        </div>
      ),
    },
    {
      title: "Request anything",
      lede: "Add as many requests as you like.",
      body: (
        <>
          <p>They go on your Trello board and we take them one at a time, in the order you choose.</p>
          <ul className={styles.chips}>
            {scopeOfWork.slice(0, 9).map((service) => (
              <li key={service}>{service}</li>
            ))}
            <li className={styles.moreChip}>+ {scopeOfWork.length - 9} more</li>
          </ul>
        </>
      ),
      visual: (
        <div className={styles.board}>
          <BoardDemo />
        </div>
      ),
    },
    {
      title: "Get it fast",
      lede: "Most requests land in about 48 hours.",
      body: <p>Bigger ones are broken into pieces, so you see progress every couple of days.</p>,
      visual: work[0] && <WorkCard item={work[0]} sizes="(min-width: 900px) 58vw, 100vw" />,
    },
    {
      title: "Make it right",
      lede: "Revisions are unlimited.",
      body: <p>We keep refining until it&apos;s exactly right, then the next request starts.</p>,
      visual: work[2] && <WorkCard item={work[2]} sizes="(min-width: 900px) 58vw, 100vw" />,
    },
    {
      title: "Pause anytime",
      lede: "Quiet month? Pause it.",
      body: (
        <p>
          Pick up where you left off whenever you&apos;re ready. Cancel from your billing page whenever you like.
        </p>
      ),
      visual: <PausingCard planId={planId} />,
    },
  ];

  // Which chapter is in the middle of the screen, for the rail.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(refs.current.indexOf(entry.target as HTMLElement));
        });
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    [...refs.current, ...outside.current].forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <main className={styles.page}>
      {/* ---------- Opening: the card, front and centre ---------- */}
      <section
        className={styles.intro}
        ref={(el) => {
          outside.current[0] = el;
        }}
      >
        <p className={styles.live}>
          <span className={styles.liveDot} aria-hidden="true" />
          Spots available · Start today
        </p>
        <h1 className={styles.giant}>
          Design, <span className={styles.muted}>by membership.</span>
        </h1>
        <MemberCard planId={planId} className={styles.introCard} />
        <p className={styles.introLede}>
          A senior design team, unlimited requests, one flat monthly fee.{" "}
          <span className={styles.muted}>Here&apos;s how it works.</span>
        </p>
        <span className={styles.cue} aria-hidden="true" />
      </section>

      {/* ---------- The five chapters ---------- */}
      <nav className={styles.rail} aria-label="Chapters" data-shown={active >= 0 || undefined}>
        {chapters.map((c, i) => (
          <a key={c.title} href={`#chapter-${i + 1}`} data-on={i === active || undefined}>
            <span>{String(i + 1).padStart(2, "0")}</span>
            {c.title}
          </a>
        ))}
      </nav>

      {chapters.map((c, i) => (
        <section
          key={c.title}
          id={`chapter-${i + 1}`}
          ref={(el) => {
            refs.current[i] = el;
          }}
          className={styles.chapter}
        >
          <div className={styles.copy}>
            <p className={styles.no}>{String(i + 1).padStart(2, "0")}</p>
            <h2 className={styles.title}>
              {c.title}. <span className={styles.muted}>{c.lede}</span>
            </h2>
            <div className={styles.body}>{c.body}</div>
          </div>
          <div className={styles.visual}>{c.visual}</div>
        </section>
      ))}

      {/* ---------- Then the proof, and the rest ---------- */}
      <div
        className={story.page}
        ref={(el) => {
          outside.current[1] = el;
        }}
      >
        <section className={story.section}>
          <header className={story.head}>
            <h2 className={story.title}>
              The work. <span className={story.muted}>Everything above, made on subscription.</span>
            </h2>
            <button type="button" className={story.secondary} onClick={() => openAskBox("booking")}>
              Talk it through on a call <span aria-hidden="true">→</span>
            </button>
          </header>
          <div className={story.work}>
            {work.map((item, i) => (
              <WorkCard key={item.id} item={item} order={i} sizes="(min-width: 820px) 600px, 100vw" />
            ))}
          </div>
        </section>
        <PricingSection />
        <QuotesSection />
        <FaqSection faqs={faqs} />
        <CloseSection planId={planId} />
        <Footer />
      </div>
    </main>
  );
}
