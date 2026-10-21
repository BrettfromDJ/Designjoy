"use client";

import { Fragment, type CSSProperties, type ReactNode } from "react";
import Image from "next/image";
import { useCountUp } from "./useCountUp";
import styles from "./FinanceCards.module.css";

const DIR = "/work/finance";

const pad = (n: number) => String(Math.round(n)).padStart(2, "0");
const i = (n: number) => ({ "--i": n }) as CSSProperties;

/** A card from the Figma design: a photo fading to black, a glass panel, and a caption. */
function Card({
  play,
  photo,
  angle,
  title,
  body,
  children,
}: {
  play: number;
  photo: ReactNode;
  /** The glass panel's gradient angle, as in the design. */
  angle: number;
  title: string;
  body: string;
  children: ReactNode;
}) {
  return (
    <div className={styles.card} data-play={play > 0 || undefined}>
      <div className={styles.photos} aria-hidden="true">
        {photo}
        <span className={styles.fade} />
      </div>
      <div className={styles.stage}>
        <div className={styles.panel} style={{ "--angle": `${angle}deg` } as CSSProperties}>
          {children}
        </div>
      </div>
      <div className={styles.copy}>
        <p className={styles.heading}>{title}</p>
        <p className={styles.body}>{body}</p>
      </div>
    </div>
  );
}

const SIZES = "(min-width: 1600px) 20vw, 40vw";

// ---------- Analyst ratings ----------

const RATINGS = [
  { label: "Strong buy", count: 43, fill: 270 },
  { label: "Buy", count: 12, fill: 120 },
  { label: "Neutral", count: 7, fill: 65 },
  { label: "Sell", count: 0, fill: 0 },
  { label: "Strong sell", count: 1, fill: 17 },
];

function Rating({ label, count, fill, n, play }: (typeof RATINGS)[number] & { n: number; play: number }) {
  const value = useCountUp(count, play, 400 + n * 90, 1000);
  return (
    <div className={styles.rating} style={i(n)}>
      <div className={styles.ratingHead}>
        <span className={styles.label}>{label}</span>
        <span className={styles.value}>{pad(value)}</span>
      </div>
      <div className={styles.track}>
        {fill > 0 && <span className={styles.fill} style={{ "--w": fill } as CSSProperties} />}
        <span className={styles.rest} />
      </div>
    </div>
  );
}

export function RatingsCard({ play, large = false }: { play: number; large?: boolean }) {
  return (
    <Card
      play={play}
      angle={146.934}
      title="Know what the experts think"
      body="View real time analyst ratings on every holding in your portfolio."
      photo={
        // Cropped as in the design.
        <span className={styles.forest}>
          <Image src={`${DIR}/forest.jpg`} alt="" fill sizes={large ? "90vw" : "60vw"} />
        </span>
      }
    >
      <div className={styles.ratings}>
        {RATINGS.map((r, n) => (
          <Rating key={r.label} {...r} n={n} play={play} />
        ))}
      </div>
    </Card>
  );
}

// ---------- Earnings graph ----------

// Dots placed as in the design (x, y in the panel): estimates are outlined,
// actual results filled.
const ESTIMATES = [
  [38, 49],
  [98, 126],
  [158, 88],
  [218, 144],
  [277, 50],
];
const ACTUALS = [
  [38, 39],
  [98, 121],
  [158, 110],
  [218, 132],
];
const LEVELS = ["11.80", "8.19", "4.56", "0.94"];
const QUARTERS = [
  ["Q3", "2024"],
  ["Q4", "2024"],
  ["Q1", "2025"],
  ["Q2", "2025"],
  ["Q3", "2025"],
];

export function EarningsCard({ play, large = false }: { play: number; large?: boolean }) {
  return (
    <Card
      play={play}
      angle={144.546}
      title="Stay ahead of earnings season"
      body="Compare earnings estimates to actual results to track company performance over time."
      photo={<Image src={`${DIR}/leaf.jpg`} alt="" fill sizes={large ? "40vw" : SIZES} className={styles.cover} />}
    >
      {ESTIMATES.map(([x, y], n) => (
        <span
          key={`e${n}`}
          className={`${styles.dot} ${styles.estimate}`}
          style={{ "--x": x, "--y": y, "--i": n } as CSSProperties}
        />
      ))}
      {ACTUALS.map(([x, y], n) => (
        <span
          key={`a${n}`}
          className={`${styles.dot} ${styles.actual}`}
          style={{ "--x": x, "--y": y, "--i": n } as CSSProperties}
        />
      ))}
      <div className={styles.earnings}>
        <div className={styles.graph}>
          <div className={styles.levels}>
            {LEVELS.map((level) => (
              <div key={level} className={styles.level}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`${DIR}/line.svg`} alt="" className={styles.gridLine} />
                <span>{level}</span>
              </div>
            ))}
          </div>
          <div className={styles.quarters}>
            {QUARTERS.map(([q, year], n) => (
              <span key={n} className={styles.quarter}>
                <b>{q}</b>
                <span>{year}</span>
              </span>
            ))}
          </div>
        </div>
        <div className={styles.legend}>
          <div>
            <span className={styles.legendLabel}>
              Estimated EPS <i className={`${styles.legendDot} ${styles.estimate}`} />
            </span>
            <span className={styles.value}>$8.73</span>
          </div>
          <div>
            <span className={styles.legendLabel}>
              Actual EPS <i className={`${styles.legendDot} ${styles.actual}`} />
            </span>
            <span className={`${styles.value} ${styles.muted}`}>Available on 5/28</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

// ---------- Fundamentals ----------

const STATS = [
  [
    ["Mkt cap", "$3.30T"],
    ["EV/Sales", "25.29"],
    ["Price sales", "$46"],
  ],
  [
    ["FY revenue", "$130.50B"],
    ["EPS", "$2.99"],
    ["Gross margin", "N/A"],
  ],
  [
    ["Profit margin", "N/A"],
    ["Beta", "2.11"],
    ["Div yield", "0.03%"],
  ],
];

export function StatsCard({ play, large = false }: { play: number; large?: boolean }) {
  return (
    <Card
      play={play}
      angle={149.676}
      title="Dig into the fundamentals"
      body="Access financial statements, growth metrics, and key details about every company in your portfolio."
      photo={<Image src={`${DIR}/frond.jpg`} alt="" fill sizes={large ? "40vw" : SIZES} className={styles.cover} />}
    >
      <div className={styles.stats}>
        {STATS.map((row, r) => (
          <div key={r} className={styles.statGroup}>
            {r > 0 && (
              <div className={styles.rule}>
                {[0, 1, 2].map((n) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={n} src={`${DIR}/divider-horizontal.svg`} alt="" />
                ))}
              </div>
            )}
            <div className={styles.statRow}>
              {row.map(([label, value], c) => (
                <Fragment key={label}>
                  {c > 0 && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={`${DIR}/divider-vertical.svg`} alt="" className={styles.vRule} />
                  )}
                  <div className={styles.stat} style={i(r * 3 + c)}>
                    <span className={styles.label}>{label}</span>
                    <span className={`${styles.value} ${value === "N/A" ? styles.muted : ""}`}>{value}</span>
                  </div>
                </Fragment>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
