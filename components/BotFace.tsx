"use client";

import { useEffect, useRef } from "react";
import styles from "./BotFace.module.css";

// How far (in the icon's 24-unit space) the face can slide toward the
// cursor, and how far away the cursor must be for it to look all the way over.
const REACH = 3.6;
const FULL_LOOK_PX = 260;
// The face is drawn a little large; this scales it to size.
const FACE_SCALE = 0.86;
const AT_REST = `scale(${FACE_SCALE})`;
// While typing, it watches the text to its right.
const LOOK_AT_TEXT = `translate(3.2px, 0.6px) scale(${FACE_SCALE})`;

/**
 * The ask box's mascot: a ball with pill eyes and the Designjoy smile.
 * The face slides around the ball to look at the pointer and blinks. It
 * perks up when the box is hovered and watches the text while you type.
 */
export function BotFace({
  size = 24,
  thinking = false,
  typing = false,
  excited = false,
}: {
  size?: number;
  thinking?: boolean;
  typing?: boolean;
  excited?: boolean;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const faceRef = useRef<SVGGElement>(null);
  const typingRef = useRef(typing);
  const lastLook = useRef(AT_REST);

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
        lastLook.current = `translate(${x}px, ${y}px) scale(${FACE_SCALE})`;
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

  return (
    <span className={styles.wrap} style={{ width: size, height: size }} data-excited={excited}>
      <svg
        ref={svgRef}
        className={styles.bot}
        data-thinking={thinking}
        width={size}
        height={size}
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <defs>
          <clipPath id="bot-clip">
            <circle cx="12" cy="12" r="11" />
          </clipPath>
        </defs>
        <circle cx="12" cy="12" r="11" fill="#c4c4c4" />
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
    </span>
  );
}
