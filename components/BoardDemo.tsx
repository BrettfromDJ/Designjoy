"use client";

import { useEffect, useRef } from "react";
import styles from "./BoardDemo.module.css";

/** What each step of the demo shows, in order. */
export const BOARD_STEPS = [
  "Add every request to Backlog. There's no limit.",
  "Move one into Current request. That's what we're designing.",
  "Most designs land on the card in about 48 hours.",
  "Ask for revisions in the comments, as many as you need.",
  "Happy with it? Move it to Approved.",
  "Then the next request moves up, and we start on it.",
];
const STEP_MS = [3400, 2800, 3000, 3600, 2800, 3000];

// The board is laid out at a fixed size and scaled to fit its container.
const W = 800;
const H = 380;
const COL_W = 256;
const GAP = 16;
const TOP = 44;
const HEAD = 38;
const CARD_GAP = 8;

const COLUMNS = [
  { id: "backlog", name: "Backlog" },
  { id: "current", name: "Current request", limit: 1 },
  { id: "approved", name: "Approved" },
] as const;
type ColumnId = (typeof COLUMNS)[number]["id"];

const CARDS: Record<string, { title: string }> = {
  landing: { title: "Landing page redesign" },
  deck: { title: "Series A pitch deck" },
  ads: { title: "Launch social ads" },
};

function el(tag: string, className: string, html = "") {
  const node = document.createElement(tag);
  node.className = className;
  node.innerHTML = html;
  return node;
}

/**
 * A wireframe of a client's Trello board that plays a request's life on a
 * loop: added to Backlog, moved to Current request, delivered, revised,
 * approved, then the next one moves up. Built imperatively because it's a
 * small animation timeline, not app state.
 */
export function BoardDemo({ onStep }: { onStep?: (step: number) => void }) {
  const fitRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const onStepRef = useRef(onStep);
  onStepRef.current = onStep;

  useEffect(() => {
    const fit = fitRef.current;
    const stage = stageRef.current;
    if (!fit || !stage) return;
    stage.innerHTML = "";

    stage.append(
      el(
        "div",
        styles.boardBar,
        `<b>Your company · Designjoy</b><span class="${styles.label}">Board</span><i></i>`,
      ),
    );
    const columnEls = {} as Record<ColumnId, HTMLElement>;
    COLUMNS.forEach((c, i) => {
      const col = el(
        "div",
        styles.column,
        `<div class="${styles.columnHead}"><span>${c.name}</span><span class="${styles.count}"></span></div>`,
      );
      col.style.left = `${i * (COL_W + GAP)}px`;
      if ("limit" in c) col.querySelector(`.${styles.count}`)!.classList.add(styles.limit);
      stage.append(col);
      columnEls[c.id] = col;
    });
    const cardEls: Record<string, HTMLElement> = {};
    for (const [id, card] of Object.entries(CARDS)) {
      const node = el(
        "div",
        `${styles.card} ${styles.hidden}`,
        `<div class="${styles.cardTitle}">${card.title}</div>` +
          `<div class="${styles.thumb}"></div>` +
          `<div class="${styles.bars}"><b></b><b></b></div>` +
          `<div class="${styles.meta}"><span class="${styles.tag}">In review</span>` +
          `<span class="${styles.status}"><i></i>Designing</span>` +
          `<span class="${styles.comments}"><svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"><path d="M1 1.5h8v5.2H4.2L2 8.6V6.7H1z" fill="none" stroke="currentColor"/></svg> <span data-count>1</span></span>` +
          `<span class="${styles.avatar}"></span></div>` +
          `<div class="${styles.progress}"><b></b></div>`,
      );
      stage.append(node);
      cardEls[id] = node;
    }
    const ask = el("div", styles.bubble, "Can we try a darker hero?");
    const reply = el("div", `${styles.bubble} ${styles.reply}`, "On it, updated ✓");
    const cursor = el(
      "div",
      styles.cursor,
      `<svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><path d="M2 1.5 15.5 8 9 9.6 6.4 16Z" fill="#fff" stroke="#000"/></svg>`,
    );
    stage.append(ask, reply, cursor);

    let cols: Record<ColumnId, string[]> = { backlog: [], current: [], approved: [] };
    let timers: number[] = [];
    let next = 0;
    const wait = (ms: number) =>
      new Promise<void>((resolve) => timers.push(window.setTimeout(resolve, ms)));
    const setCursor = (x: number, y: number, visible = true) => {
      cursor.style.transform = `translate(${x}px, ${y}px)`;
      cursor.style.opacity = visible ? "1" : "0";
    };
    const pos = (col: ColumnId, index: number) => {
      let y = TOP + HEAD;
      for (let k = 0; k < index; k++) y += cardEls[cols[col][k]].offsetHeight + CARD_GAP;
      return { x: COLUMNS.findIndex((c) => c.id === col) * (COL_W + GAP) + 12, y };
    };
    const layout = (skip?: string) => {
      for (const col of Object.keys(cols) as ColumnId[]) {
        cols[col].forEach((id, i) => {
          if (id === skip) return;
          const p = pos(col, i);
          cardEls[id].classList.remove(styles.hidden);
          cardEls[id].style.transform = `translate(${p.x}px, ${p.y}px)`;
        });
      }
      for (const c of COLUMNS) {
        const n = cols[c.id].length;
        const badge = columnEls[c.id].querySelector(`.${styles.count}`)!;
        badge.textContent = "limit" in c ? `${n} / ${c.limit}` : String(n);
        badge.classList.toggle(styles.full, "limit" in c && n >= c.limit);
      }
      for (const id of Object.keys(CARDS)) {
        if (!Object.values(cols).some((list) => list.includes(id))) cardEls[id].classList.add(styles.hidden);
      }
    };
    const reset = () => {
      cols = { backlog: [], current: [], approved: [] };
      for (const node of Object.values(cardEls)) {
        node.classList.remove(styles.done, styles.review, styles.chat, styles.lift, styles.working);
        const bar = node.querySelector<HTMLElement>(`.${styles.progress} b`)!;
        bar.style.transition = "none";
        bar.style.transform = "scaleX(0)";
        node.querySelector("[data-count]")!.textContent = "1";
      }
      ask.classList.remove(styles.on);
      reply.classList.remove(styles.on);
      setCursor(700, 330, false);
    };

    // The cursor picks a card up and drops it at the end of another column.
    const drag = async (id: string, to: ColumnId) => {
      const from = (Object.keys(cols) as ColumnId[]).find((c) => cols[c].includes(id))!;
      const card = cardEls[id];
      const start = pos(from, cols[from].indexOf(id));
      setCursor(start.x + 120, start.y + 20);
      await wait(650);
      cursor.classList.add(styles.grab);
      card.classList.add(styles.lift);
      card.style.zIndex = "4";
      await wait(200);
      cols[from] = cols[from].filter((c) => c !== id);
      cols[to].push(id);
      const end = pos(to, cols[to].length - 1);
      columnEls[to].classList.add(styles.target);
      card.style.transform = `translate(${end.x}px, ${end.y}px) rotate(-1.5deg)`;
      setCursor(end.x + 120, end.y + 20);
      layout(id);
      await wait(750);
      card.style.transform = `translate(${end.x}px, ${end.y}px)`;
      card.classList.remove(styles.lift);
      cursor.classList.remove(styles.grab);
      columnEls[to].classList.remove(styles.target);
      await wait(250);
      card.style.zIndex = "";
      setCursor(end.x + 150, end.y + 90, false);
    };

    // While a card is the current request, it shows work in progress: a
    // status, a sweep of light, and a bar that fills as the design comes on.
    const startWork = (id: string) => {
      const card = cardEls[id];
      const bar = card.querySelector<HTMLElement>(`.${styles.progress} b`)!;
      card.classList.add(styles.working);
      bar.style.transition = "none";
      bar.style.transform = "scaleX(0)";
      void bar.offsetWidth;
      bar.style.transition = "transform 3.4s cubic-bezier(0.25, 0.6, 0.3, 1)";
      bar.style.transform = "scaleX(0.86)";
      layout();
    };
    const finishWork = async (id: string) => {
      const bar = cardEls[id].querySelector<HTMLElement>(`.${styles.progress} b`)!;
      bar.style.transition = "transform 0.45s ease-out";
      bar.style.transform = "scaleX(1)";
      await wait(550);
      cardEls[id].classList.remove(styles.working);
    };

    const steps: (() => Promise<void> | void)[] = [
      async () => {
        reset();
        layout();
        await wait(300);
        for (const id of ["landing", "deck", "ads"]) {
          cols.backlog.push(id);
          layout();
          await wait(450);
        }
      },
      async () => {
        await drag("landing", "current");
        startWork("landing");
      },
      async () => {
        await wait(400);
        await finishWork("landing");
        cardEls.landing.classList.add(styles.done, styles.review);
        await wait(450);
        layout();
      },
      async () => {
        const p = pos("current", 0);
        const h = cardEls.landing.offsetHeight;
        cardEls.landing.classList.add(styles.chat);
        layout();
        Object.assign(ask.style, { left: `${p.x + 40}px`, top: `${p.y + h + 10}px` });
        ask.classList.add(styles.on);
        await wait(1300);
        Object.assign(reply.style, { left: `${p.x + 40}px`, top: `${p.y + h + 44}px` });
        reply.classList.add(styles.on);
        cardEls.landing.querySelector("[data-count]")!.textContent = "2";
      },
      async () => {
        ask.classList.remove(styles.on);
        reply.classList.remove(styles.on);
        await wait(250);
        cardEls.landing.classList.remove(styles.review);
        layout();
        await drag("landing", "approved");
      },
      async () => {
        await drag("deck", "current");
        startWork("deck");
      },
    ];

    const run = (i: number) => {
      onStepRef.current?.(i);
      steps[i]();
      next = window.setTimeout(() => run((i + 1) % steps.length), STEP_MS[i]);
    };

    const resize = () => {
      const scale = fit.clientWidth / W;
      stage.style.transform = `scale(${scale})`;
      fit.style.height = `${H * scale}px`;
    };
    const observer = new ResizeObserver(resize);
    observer.observe(fit);
    resize();

    reset();
    layout();
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // A still of the board mid-flow instead of the animation.
      cols.backlog = ["deck", "ads"];
      cols.current = ["landing"];
      cardEls.landing.classList.add(styles.done, styles.review);
      layout();
      onStepRef.current?.(2);
    } else {
      run(0);
    }

    return () => {
      observer.disconnect();
      clearTimeout(next);
      timers.forEach(clearTimeout);
      timers = [];
    };
  }, []);

  return (
    <div ref={fitRef} className={styles.fit} aria-hidden="true">
      <div ref={stageRef} className={styles.stage} style={{ width: W, height: H }} />
    </div>
  );
}
