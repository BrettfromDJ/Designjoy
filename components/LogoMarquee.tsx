import type { ClientLogo } from "@/content/site";
import styles from "./LogoMarquee.module.css";

const MARKS: Record<NonNullable<ClientLogo["mark"]>, React.ReactNode> = {
  dot: <circle cx="10" cy="10" r="7" fill="currentColor" />,
  ring: <circle cx="10" cy="10" r="6.5" fill="none" stroke="currentColor" strokeWidth="2.5" />,
  square: <rect x="3" y="3" width="14" height="14" rx="3" fill="currentColor" />,
  triangle: <path d="M10 3l8 14H2z" fill="currentColor" />,
  arc: (
    <path
      d="M3 15a7 7 0 0114 0"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
    />
  ),
};

function Logo({ logo, hidden }: { logo: ClientLogo; hidden?: boolean }) {
  if (logo.src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={logo.src}
        alt={hidden ? "" : logo.name}
        style={{ height: logo.height ?? 18 }}
        className={styles.logo}
        loading="lazy"
      />
    );
  }
  return (
    <span
      className={`${styles.name} ${styles[logo.font ?? "sans"]}`}
      aria-hidden={hidden || undefined}
    >
      {logo.mark && (
        <svg viewBox="0 0 20 20" aria-hidden="true">
          {MARKS[logo.mark]}
        </svg>
      )}
      {logo.name}
    </span>
  );
}

/** Logos sliding in an endless loop, faded out at both ends. */
export function LogoMarquee({ logos, label }: { logos: ClientLogo[]; label: string }) {
  // The track holds the logos twice and slides by half its length, so the
  // loop is seamless. Short lists are repeated so the strip is never sparse.
  const base = Array.from({ length: Math.max(1, Math.ceil(8 / logos.length)) }, () => logos).flat();
  return (
    <div className={styles.marquee} role="region" aria-label={label}>
      <div className={styles.track} style={{ animationDuration: `${base.length * 3}s` }}>
        {[0, 1].map((copy) =>
          base.map((logo, i) => (
            <Logo key={`${copy}-${i}`} logo={logo} hidden={copy === 1 || i >= logos.length} />
          )),
        )}
      </div>
    </div>
  );
}
