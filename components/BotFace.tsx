"use client";

import { useEffect, useRef } from "react";
import styles from "./BotFace.module.css";

// How far (in the icon's 24-unit space) the face can slide toward the
// cursor, and how far away the cursor must be for it to look all the way over.
const REACH = 3.6;
const FULL_LOOK_PX = 260;
// The face is drawn turned to one side; it faces whichever way it's looking.
const AT_REST = "scale(1, 1)";
// While typing, it watches the text to its right.
const LOOK_AT_TEXT = "translate(3.2px, 0.6px) scale(1, 1)";

/**
 * The ask box's mascot: a ball with a happy face, eyes closed in crescents
 * over a wide grin. The whole face slides around the ball toward the pointer
 * and turns to face it. It perks up when the box is hovered and watches the
 * text while you type.
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
        // Turned toward the pointer: mirrored when it's off to the left.
        const turn = dx < -12 ? -1 : 1;
        lastLook.current = `translate(${x}px, ${y}px) scale(${turn}, 1)`;
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
              {/* Drawn turned to the right, then centred on the ball. */}
              <g fill="#0a0a0a" transform="translate(12 12.4) scale(0.95) translate(-16.85 -12.85)">
                {/* Closed, smiling eyes: two crescents arching up, the far one
                    smaller as the face is turned. */}
                <g className={styles.eyes}>
                  <path d="M12.6 10 C13.3 8.1 14 7.4 15 7.4 C16.3 7.4 17.4 8.6 17.5 10.7 C16.8 9.6 16 9.05 15 9.05 C14.1 9.05 13.4 9.5 12.6 10 Z" />
                  <path d="M19.6 11.1 C19.8 9.9 20.2 9 20.8 9 C21.6 9 22.2 10.2 22.3 11.5 C21.9 10.9 21.5 10.5 21 10.5 C20.5 10.5 20 10.8 19.6 11.1 Z" />
                </g>
                {/* A wide grin. */}
                <path
                  className={styles.mouth}
                  d="M11.4 12.9 C11.9 15.6 14.3 18.3 17.2 18.3 C19.4 18.3 21 16.6 22.1 14.2 C20.7 15.6 19.4 16.2 18.2 16.2 C15.6 16.2 13.8 14.8 12.4 13.1 C12.1 12.6 11.3 12.4 11.4 12.9 Z"
                />
              </g>
            </g>
          </g>
        </g>
      </svg>
    </span>
  );
}
