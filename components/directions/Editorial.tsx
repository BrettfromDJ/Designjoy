"use client";

import { Fragment, useRef, type CSSProperties } from "react";
import { plans, scopeOfWork, testimonials, type Faq, type WorkItem } from "@/content/site";
import { openAskBox } from "@/lib/ask-box";
import { startCheckout } from "@/lib/checkout";
import { BoardDemo } from "../BoardDemo";
import { MemberCard } from "../prototypes/MemberCard";
import { plain } from "../prototypes/data";
import { WorkCard } from "../WorkCard";
import { ForceTheme, Reveal, useInView } from "./kit";
import styles from "./Editorial.module.css";

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];

/** "Designjoy", set letter by letter so it can rise in. */
function Masthead() {
  const ref = useRef<HTMLHeadingElement>(null);
  const seen = useInView(ref, "0px");
  return (
    <h1 ref={ref} className={styles.masthead} data-in={seen || undefined} aria-label="Designjoy">
      {"Designjoy".split("").map((letter, i) => (
        <span key={i} aria-hidden="true" style={{ "--i": i } as CSSProperties}>
          {letter}
        </span>
      ))}
    </h1>
  );
}

/** A plate: a piece of work with its caption, developing in as it's reached. */
function Plate({ item, n, wide }: { item: WorkItem; n: number; wide?: boolean }) {
  return (
    <Reveal kind="blur" className={`${styles.plate} ${wide ? styles.wide : ""}`}>
      <WorkCard item={item} sizes={wide ? "(min-width: 1240px) 1200px, 100vw" : "(min-width: 820px) 600px, 100vw"} />
      <p className={styles.plateCaption}>
        <span>Plate {ROMAN[n] ?? n + 1}.</span> <em>{item.company ?? "Designjoy"}</em>, {item.title.toLowerCase()}
      </p>
    </Reveal>
  );
}

/** A section's running head: number, title and a rule that draws across. */
function Head({ no, title, note }: { no: string; title: string; note?: string }) {
  return (
    <Reveal className={styles.head}>
      <span className={styles.no}>No. {no}</span>
      <h2 className={styles.h2}>{title}</h2>
      {note && <span className={styles.note}>{note}</span>}
    </Reveal>
  );
}

/**
 * Direction 2, "Editorial": Designjoy as a printed design magazine. A
 * masthead, the membership card tipped in like an insert, the work as
 * plates, how it works as an index, pricing as a rate card and the
 * questions as letters to the editor.
 */
export function Editorial({ work, faqs }: { work: WorkItem[]; faqs: Faq[] }) {
  const [monthly, pro] = plans;
  const [first, second, third, ...rest] = work;
  const quote = testimonials.find((t) => t.name) ?? testimonials[0];
  const other = testimonials.find((t) => t !== quote);

  return (
    <main className={styles.page}>
      <ForceTheme theme="light" />

      {/* ---------- The cover ---------- */}
      <header className={styles.cover}>
        <div className={styles.meta}>
          <span>Vol. 01 · The membership issue</span>
          <span>Design, on subscription</span>
          <span>From {monthly.price} a month</span>
        </div>
        <Masthead />
        <div className={styles.coverGrid}>
          <Reveal as="nav" className={styles.contents} delay={300}>
            <p className={styles.label}>In this issue</p>
            {[
              ["The work", "02", "#work"],
              ["How it works", "03", "#how"],
              ["The rate card", "04", "#rates"],
              ["Letters", "05", "#letters"],
            ].map(([title, page, href]) => (
              <a key={title} href={href}>
                <span>{title}</span>
                <i />
                <span>{page}</span>
              </a>
            ))}
          </Reveal>

          <div className={styles.insert}>
            <span className={styles.tape} aria-hidden="true" />
            <span className={`${styles.tape} ${styles.tapeRight}`} aria-hidden="true" />
            <MemberCard planId={monthly.id} />
            <p className={styles.cut}>✂ Detach and keep. Valid for unlimited requests.</p>
          </div>

          <Reveal className={styles.lead} delay={450}>
            <p className={styles.dropcap}>
              Designjoy is a design studio you subscribe to. One membership puts a senior designer on your work:
              logos, websites, apps and decks, one request after another, most delivered in about two days.
            </p>
            <p>No contracts and no surprise invoices. Pause when it&apos;s quiet, cancel whenever you like.</p>
            <div className={styles.buttons}>
              <button type="button" className={styles.primary} onClick={() => startCheckout(monthly.id)}>
                Subscribe
              </button>
              <button type="button" className={styles.textLink} onClick={() => openAskBox("booking")}>
                Book a call →
              </button>
            </div>
          </Reveal>
        </div>
      </header>

      {/* ---------- The ticker of what we design ---------- */}
      <div className={styles.ticker} aria-label="What we design">
        <div className={styles.tickerTrack}>
          {[0, 1].map((copy) => (
            <span key={copy} aria-hidden={copy === 1 || undefined}>
              {scopeOfWork.map((s) => (
                <Fragment key={s}>
                  <em>{s}</em>
                  <b>✦</b>
                </Fragment>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* ---------- The work ---------- */}
      <section id="work" className={styles.section}>
        <Head no="02" title="The work" note={`${work.length} plates`} />
        <div className={styles.plates}>
          {first && <Plate item={first} n={0} wide />}
          {second && <Plate item={second} n={1} />}
          {third && <Plate item={third} n={2} />}
          {quote && (
            <Reveal as="figure" kind="blur" className={styles.pull}>
              <blockquote>“{quote.quote}”</blockquote>
              <figcaption>
                — {quote.name}
                {quote.role && `, ${quote.role}`}
              </figcaption>
            </Reveal>
          )}
          {rest.map((item, i) => (
            <Plate key={item.id} item={item} n={i + 3} wide={rest.length % 2 === 1 && i === 0} />
          ))}
        </div>
      </section>

      {/* ---------- How it works ---------- */}
      <section id="how" className={styles.section}>
        <Head no="03" title="How it works" note="Five lines, then it's on repeat" />
        <div className={styles.how}>
          <ol className={styles.index}>
            {[
              ["Subscribe", "Your Trello board, within hours"],
              ["Request", "As many as you like"],
              ["Receive", "Most in about 48 hours"],
              ["Revise", "Until it's right"],
              ["Pause", "Whenever it's quiet"],
            ].map(([what, when], i) => (
              <Reveal as="li" key={what} delay={i * 90}>
                <span className={styles.indexNo}>{String(i + 1).padStart(2, "0")}</span>
                <span className={styles.indexWhat}>{what}</span>
                <i />
                <span className={styles.indexWhen}>{when}</span>
              </Reveal>
            ))}
          </ol>
          <Reveal as="figure" kind="blur" className={styles.figure}>
            <div className={styles.figureFrame}>
              <BoardDemo />
            </div>
            <figcaption>
              <span>Fig. 1.</span> A request&apos;s life on your Trello board, from backlog to approved.
            </figcaption>
          </Reveal>
        </div>
      </section>

      {/* ---------- The rate card ---------- */}
      <section id="rates" className={styles.section}>
        <Head no="04" title="The rate card" note="Billed monthly · Cancel anytime" />
        <Reveal className={styles.rates}>
          <table>
            <thead>
              <tr>
                <th scope="col" />
                {plans.map((p) => (
                  <th key={p.id} scope="col">
                    <span className={styles.rateName}>
                      {p.name}
                      {p.tag && <sup>{p.tag}</sup>}
                    </span>
                    <span className={styles.ratePrice}>
                      {p.price}
                      <small>/mo</small>
                    </span>
                    <span className={styles.rateNote}>{p.description}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {monthly.features.map((f) => (
                <tr key={f}>
                  <th scope="row">{f}</th>
                  <td>●</td>
                  <td>●</td>
                </tr>
              ))}
              {pro.features.slice(1).map((f) => (
                <tr key={f}>
                  <th scope="row">{f}</th>
                  <td className={styles.none}>—</td>
                  <td>●</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td />
                {plans.map((p) => (
                  <td key={p.id}>
                    <button
                      type="button"
                      className={p.highlight ? styles.primary : styles.outline}
                      onClick={() => startCheckout(p.id)}
                    >
                      Subscribe to {p.name}
                    </button>
                  </td>
                ))}
              </tr>
            </tfoot>
          </table>
        </Reveal>
      </section>

      {/* ---------- Letters ---------- */}
      <section id="letters" className={styles.section}>
        <Head no="05" title="Letters to the editor" note="Your questions, answered" />
        <div className={styles.letters}>
          {faqs.slice(0, 8).map((faq, i) => (
            <Reveal as="article" key={faq.question} delay={(i % 2) * 120}>
              <p className={styles.dear}>Dear Designjoy, {faq.question.charAt(0).toLowerCase() + faq.question.slice(1)}</p>
              <p className={styles.answer}>{plain(faq.answer)}</p>
            </Reveal>
          ))}
        </div>
        <p className={styles.more}>
          More letters?{" "}
          <button type="button" className={styles.textLink} onClick={() => openAskBox("chat")}>
            Write to us →
          </button>
        </p>
      </section>

      {/* ---------- Back cover ---------- */}
      <section className={styles.back}>
        <Reveal kind="mask" as="h2" className={styles.backTitle}>
          Subscribe to
        </Reveal>
        <Reveal kind="mask" as="h2" className={styles.backTitle} delay={120}>
          <em>every issue.</em>
        </Reveal>
        {other && (
          <p className={styles.backQuote}>
            “{other.quote}” — {other.name ?? other.company}
          </p>
        )}
        <div className={styles.buttons}>
          <button type="button" className={styles.primary} onClick={() => startCheckout(monthly.id)}>
            Subscribe to Monthly Club
          </button>
          <button type="button" className={styles.textLink} onClick={() => openAskBox("booking")}>
            Or book a 15 min call →
          </button>
        </div>
        <p className={styles.colophon}>
          Colophon. Set in Instrument Serif and Inter. Made by the same team that would design yours.
        </p>
      </section>

      <footer className={styles.footer}>
        <span>© {new Date().getFullYear()} Designjoy</span>
        <a href="/terms">Terms</a>
        <a href="/privacy">Privacy</a>
      </footer>
    </main>
  );
}
