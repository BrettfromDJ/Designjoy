"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./BotFace.module.css";

// How far (in the icon's 24-unit space) the face can slide toward the
// cursor, and how far away the cursor must be for it to look all the way over.
const REACH = 3.6;
const FULL_LOOK_PX = 260;
// While typing, it watches the text to its right.
const LOOK_AT_TEXT = "translate(3.2px, 0.6px) scale(0.88)";

type Sparkle = { id: number; x: number; y: number; size: number; delay: number };

let sparkleId = 0;
function burst(count: number): Sparkle[] {
  return Array.from({ length: count }, (_, i) => {
    // Spread around the top half of the ball, where there's room inside the pill.
    const angle = -Math.PI * (0.15 + (0.7 * (i + Math.random() * 0.8)) / count);
    const distance = 20 + Math.random() * 8;
    return {
      id: sparkleId++,
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance * 0.7,
      size: 7 + Math.random() * 5,
      delay: i * 40,
    };
  });
}

/**
 * The ask box's mascot: a ball with pill eyes and the Designjoy smile.
 * The face slides around the ball to look at the pointer and blinks. It
 * perks up with sparkles when the box is hovered, watches the text while
 * you type, and bounces on each keystroke (`poke` changes).
 */
export function BotFace({
  size = 24,
  thinking = false,
  typing = false,
  excited = false,
  poke = 0,
}: {
  size?: number;
  thinking?: boolean;
  typing?: boolean;
  excited?: boolean;
  poke?: number;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const faceRef = useRef<SVGGElement>(null);
  const typingRef = useRef(typing);
  const lastLook = useRef("");
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);
  const [bounce, setBounce] = useState(0);

  // Look at the pointer, or at the text while typing.
  useEffect(() => {
    typingRef.current = typing;
    const face = faceRef.current;
    if (face) face.style.transform = typing ? LOOK_AT_TEXT : lastLook.current;
  }, [typing]);

  useEffect(() => {
    const svg = svgRef.current;
    const face = faceRef.current;
    if (!svg || !face) return;
    let frame = 0;
    const look = (event: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const box = svg.getBoundingClientRect();
        const dx = event.clientX - (box.left + box.width / 2);
        const dy = event.clientY - (box.top + box.height / 2);
        const distance = Math.hypot(dx, dy) || 1;
        const pull = Math.min(distance / FULL_LOOK_PX, 1);
        const x = (dx / distance) * REACH * pull;
        const y = (dy / distance) * REACH * pull;
        // Features near the edge of the ball shrink a little, as if wrapping round it.
        lastLook.current = `translate(${x}px, ${y}px) scale(${1 - 0.14 * pull})`;
        if (!typingRef.current) face.style.transform = lastLook.current;
      });
    };
    window.addEventListener("pointermove", look, { passive: true });
    window.addEventListener("pointerdown", look, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", look);
      window.removeEventListener("pointerdown", look);
    };
  }, []);

  // Sparkles: a burst on hover, and now and then while typing.
  const add = (list: Sparkle[]) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setSparkles((current) => [...current, ...list].slice(-12));
  };
  useEffect(() => {
    if (excited) add(burst(4));
  }, [excited]);
  useEffect(() => {
    if (!poke) return;
    setBounce((n) => n + 1);
    if (Math.random() < 0.35) add(burst(1));
  }, [poke]);

  return (
    <span className={styles.wrap} style={{ width: size, height: size }} data-excited={excited}>
      <svg
        ref={svgRef}
        className={styles.bot}
        data-thinking={thinking}
        data-bounce={bounce === 0 ? undefined : bounce % 2 ? "a" : "b"}
        width={size}
        height={size}
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <defs>
          <radialGradient id="bot-ball" cx="38%" cy="32%" r="75%">
            <stop offset="0" stopColor="#e8e8e8" />
            <stop offset="0.55" stopColor="#bcbcbc" />
            <stop offset="1" stopColor="#707070" />
          </radialGradient>
          <clipPath id="bot-clip">
            <circle cx="12" cy="12" r="11" />
          </clipPath>
        </defs>
        <circle cx="12" cy="12" r="11" fill="url(#bot-ball)" />
        <g clipPath="url(#bot-clip)">
          <g ref={faceRef} className={styles.face} style={{ transform: typing ? LOOK_AT_TEXT : lastLook.current }}>
            <g className={styles.look}>
              <g className={styles.eyes} fill="#0a0a0a">
                <rect x="7.9" y="6.8" width="2.4" height="4.6" rx="1.2" />
                <rect x="13.7" y="6.8" width="2.4" height="4.6" rx="1.2" />
              </g>
              {/* The Designjoy smile, scaled down from the logo. */}
              <g className={styles.smile}>
              <path
                transform="translate(6.4 13.6) scale(0.4)"
                fill="#0a0a0a"
                d="M24.562 0.0428649C25.5492 0.2591 26.1738 1.23273 25.957 2.21754C24.8517 7.23956 20.3689 11 15 11C9.63118 11 5.14834 7.23997 4.04296 2.2175C3.82622 1.2327 4.4508 0.259075 5.438 0.042858C6.42519 -0.173359 7.40118 0.449705 7.61792 1.43451C8.36259 4.81805 11.3868 7.34876 15 7.34876C18.6131 7.34876 21.6374 4.81775 22.3821 1.43448C22.5988 0.449677 23.5748 -0.17337 24.562 0.0428649Z"
              />
              </g>
            </g>
          </g>
        </g>
      </svg>
      {sparkles.map((s) => (
        <svg
          key={s.id}
          className={styles.sparkle}
          style={
            {
              "--x": `${s.x}px`,
              "--y": `${s.y}px`,
              width: s.size,
              height: s.size,
              animationDelay: `${s.delay}ms`,
            } as React.CSSProperties
          }
          viewBox="0 0 10 10"
          aria-hidden="true"
          onAnimationEnd={() => setSparkles((current) => current.filter((x) => x.id !== s.id))}
        >
          <path d="M5 0c.3 2.6 1.4 3.7 4 4-2.6.3-3.7 1.4-4 4-.3-2.6-1.4-3.7-4-4 2.6-.3 3.7-1.4 4-4Z" fill="#fff" />
        </svg>
      ))}
    </span>
  );
}
