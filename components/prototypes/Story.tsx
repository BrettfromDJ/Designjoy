"use client";

import { useState } from "react";
import { clientLogos, plans, scopeOfWork, testimonials, type Faq, type Plan, type WorkItem } from "@/content/site";
import { openAskBox } from "@/lib/ask-box";
import { startCheckout } from "@/lib/checkout";
import { BoardDemo } from "../BoardDemo";
import { CheckIcon, PlusIcon } from "../Icons";
import { LogoMarquee } from "../LogoMarquee";
import { WorkCard } from "../WorkCard";
import { plain } from "./data";
import { MemberCard, PlanSwitch } from "./MemberCard";
import styles from "./Story.module.css";

const STEPS = [
  {
    title: "Subscribe",
    body: "Pick a plan and you're in. Your Trello board arrives within a few hours.",
  },
  {
    title: "Request",
    body: "Add as many requests as you like, from logos to full products. We take them one at a time, in your order.",
  },
  {
    title: "Receive",
    body: "Most requests land in about 48 hours. Revise until it's right, then the next one starts.",
  },
];

/**
 * Prototype 1, "Story": the classic way down a page, for visitors who read
 * top to bottom. The membership card leads, then proof, the work, how it
 * works, what we design, pricing, kind words and questions, and the card
 * again to close.
 */
export function Story({ work, faqs }: { work: WorkItem[]; faqs: Faq[] }) {
  const [planId, setPlanId] = useState<Plan["id"]>(plans[0].id);
  const plan = plans.find((p) => p.id === planId) ?? plans[0];

  return (
    <main className={styles.page}>
      {/* ---------- Hero: the promise, and the card ---------- */}
      <section className={styles.hero}>
        <div className={styles.heroText}>
          <p className={styles.live}>
            <span className={styles.liveDot} aria-hidden="true" />
            Spots available · Start today
          </p>
          <h1 className={styles.display}>
            Design, on subscription. <span className={styles.muted}>One membership, unlimited requests.</span>
          </h1>
          <p className={styles.lede}>
            A senior design team you can hand anything to: logos, websites, apps and decks. Most requests land in about
            48 hours, for one flat monthly fee. Pause or cancel anytime.
          </p>
          <div className={styles.buttons}>
            <button type="button" className={styles.primary} onClick={() => startCheckout(plan.id)}>
              Join {plan.name}
            </button>
            <button type="button" className={styles.secondary} onClick={() => openAskBox("booking")}>
              Book a 15 min call <span aria-hidden="true">→</span>
            </button>
          </div>
          <dl className={styles.facts}>
            <div>
              <dt>~48h</dt>
              <dd>Average delivery</dd>
            </div>
            <div>
              <dt>Unlimited</dt>
              <dd>Requests and revisions</dd>
            </div>
            <div>
              <dt>Anytime</dt>
              <dd>Pause or cancel</dd>
            </div>
          </dl>
        </div>
        <div className={styles.heroCard}>
          <MemberCard planId={planId} />
          <PlanSwitch planId={planId} onChange={setPlanId} />
          <p className={styles.cardNote}>
            {plan.price}/mo · {plan.description}
          </p>
        </div>
      </section>

      {clientLogos.length > 0 && (
        <section className={styles.logos} aria-label="Trusted by">
          <p className={styles.eyebrow}>Trusted by teams at</p>
          <LogoMarquee logos={clientLogos} label="Companies we've worked with" />
        </section>
      )}

      <WorkSection work={work} />

      {/* ---------- How it works ---------- */}
      <section className={styles.section}>
        <header className={styles.head}>
          <h2 className={styles.title}>
            How it works. <span className={styles.muted}>Three steps, then it&apos;s on repeat.</span>
          </h2>
        </header>
        <div className={styles.how}>
          <ol className={styles.steps}>
            {STEPS.map((step, i) => (
              <li key={step.title}>
                <span className={styles.stepNo}>{String(i + 1).padStart(2, "0")}</span>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </li>
            ))}
          </ol>
          <div className={styles.board}>
            <BoardDemo />
          </div>
        </div>
      </section>

      {/* ---------- Scope ---------- */}
      <section className={styles.section}>
        <header className={styles.head}>
          <h2 className={styles.title}>
            Anything you need designed. <span className={styles.muted}>Unlimited brands, one membership.</span>
          </h2>
        </header>
        <ul className={styles.chips}>
          {scopeOfWork.map((service) => (
            <li key={service}>{service}</li>
          ))}
        </ul>
      </section>

      <PricingSection />
      <QuotesSection />
      <FaqSection faqs={faqs} />
      <CloseSection planId={planId} />
      <Footer />
    </main>
  );
}

/** The work: one large, then two across. */
export function WorkSection({ work }: { work: WorkItem[] }) {
  const [lead, ...rest] = work;
  return (
    <section className={styles.section}>
      <header className={styles.head}>
        <h2 className={styles.title}>
          Recent work. <span className={styles.muted}>Brands, products and sites, all made on subscription.</span>
        </h2>
        <a href="/" className={styles.more}>
          See everything <span aria-hidden="true">→</span>
        </a>
      </header>
      <div className={styles.work}>
        {lead && (
          <div className={styles.lead}>
            <WorkCard item={lead} sizes="(min-width: 1240px) 1200px, 100vw" />
          </div>
        )}
        {rest.slice(0, 6).map((item, i) => (
          <WorkCard key={item.id} item={item} order={i + 1} sizes="(min-width: 820px) 600px, 100vw" />
        ))}
      </div>
    </section>
  );
}

/** The two plans side by side. */
export function PricingSection() {
  return (
    <section className={styles.section} id="pricing">
      <header className={styles.head}>
        <h2 className={styles.title}>
          One flat monthly fee. <span className={styles.muted}>No contracts, no surprises.</span>
        </h2>
      </header>
      <div className={styles.plans}>
        {plans.map((p) => (
          <article key={p.id} className={styles.plan} data-highlight={p.highlight || undefined}>
            <p className={styles.planName}>
              {p.name}
              {p.tag && <span className={styles.tag}>{p.tag}</span>}
            </p>
            <p className={styles.price}>
              {p.price}
              <span className={styles.muted}>/mo</span>
            </p>
            <p className={styles.planDescription}>{p.description}</p>
            <ul className={styles.features}>
              {p.features.map((feature, i) => (
                <li key={feature}>
                  {p.additions && i > 0 ? <PlusIcon /> : <CheckIcon />}
                  {feature}
                </li>
              ))}
            </ul>
            <button
              type="button"
              className={p.highlight ? styles.primary : styles.secondaryFull}
              onClick={() => startCheckout(p.id)}
            >
              Join {p.name}
            </button>
          </article>
        ))}
      </div>
      <p className={styles.aside}>
        Not sure yet?{" "}
        <button type="button" onClick={() => openAskBox("booking")}>
          Book a 15 min intro call <span aria-hidden="true">→</span>
        </button>
      </p>
    </section>
  );
}

export function QuotesSection() {
  return (
    <section className={styles.section}>
      <div className={styles.quotes}>
        {testimonials.map((t) => (
          <figure key={t.quote}>
            <blockquote>“{t.quote}”</blockquote>
            <figcaption>
              {t.name ?? t.company}
              {t.role && <span className={styles.muted}> · {t.role}</span>}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

export function FaqSection({ faqs }: { faqs: Faq[] }) {
  return (
    <section className={styles.section}>
      <div className={styles.faq}>
        <header>
          <h2 className={styles.title}>
            Questions. <span className={styles.muted}>Answered.</span>
          </h2>
          <button type="button" className={styles.secondary} onClick={() => openAskBox("chat")}>
            Ask anything <span aria-hidden="true">→</span>
          </button>
        </header>
        <div className={styles.faqList}>
          {faqs.map((faq) => (
            <details key={faq.question}>
              <summary>{faq.question}</summary>
              <p>{plain(faq.answer)}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/** The card again, to close. */
export function CloseSection({ planId }: { planId: Plan["id"] }) {
  const plan = plans.find((p) => p.id === planId) ?? plans[0];
  return (
    <section className={styles.close}>
      <MemberCard planId={planId} className={styles.closeCard} />
      <h2 className={styles.display}>
        Your membership is waiting. <span className={styles.muted}>Start today.</span>
      </h2>
      <div className={styles.buttons}>
        <button type="button" className={styles.primary} onClick={() => startCheckout(plan.id)}>
          Join {plan.name}
        </button>
        <button type="button" className={styles.secondary} onClick={() => openAskBox("booking")}>
          Book a call <span aria-hidden="true">→</span>
        </button>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className={styles.footer}>
      <span>© {new Date().getFullYear()} Designjoy</span>
      <a href="/terms">Terms</a>
      <a href="/privacy">Privacy</a>
    </footer>
  );
}
