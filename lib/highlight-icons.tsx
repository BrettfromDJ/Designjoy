// The built-in icons for highlights, used on the homepage and in the admin.
// Simple monochrome line icons, drawn on a 32px grid.

export const HIGHLIGHT_ICONS = {
  trophy: "M10 5h12v6a6 6 0 0 1-12 0V5Zm0 2H6v2a4 4 0 0 0 4 4m12-6h4v2a4 4 0 0 1-4 4m-6 4v5m-5 4h10m-8-4h6",
  ribbon:
    "M16 4a7.5 7.5 0 1 1 0 15 7.5 7.5 0 0 1 0-15Zm-4.6 13.4L9 28l7-3.6 7 3.6-2.4-10.6M16 8.5a3 3 0 1 1 0 6 3 3 0 0 1 0-6Z",
  star: "m16 4 3.6 7.6 8.4 1-6.2 5.8 1.6 8.3L16 22.6l-7.4 4.1 1.6-8.3L4 12.6l8.4-1L16 4Z",
  medal:
    "M11 4h10l-3 8h-4l-3-8Zm5 8a7 7 0 1 1 0 14 7 7 0 0 1 0-14Zm0 3.5 1.2 2.4 2.6.4-1.9 1.8.5 2.6-2.4-1.3-2.4 1.3.5-2.6-1.9-1.8 2.6-.4 1.2-2.4Z",
} as const;

export type HighlightIcon = keyof typeof HIGHLIGHT_ICONS;
export const HIGHLIGHT_ICON_NAMES = Object.keys(HIGHLIGHT_ICONS) as HighlightIcon[];

export function HighlightIconSvg({ icon, size = 32 }: { icon: HighlightIcon; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={HIGHLIGHT_ICONS[icon]} />
    </svg>
  );
}

/** One highlight: an award, feature or mention. */
export type Highlight = {
  id: string;
  /** The award, e.g. "Site of the Day". */
  title: string;
  /** Who gave it and for what, e.g. "Awwwards · Ordin, 2026". */
  detail: string;
  /** A built-in icon, used when there's no uploaded image. */
  icon: HighlightIcon;
  /** An uploaded icon (e.g. the awarding body's app icon), if any. */
  image?: string;
};

export const MAX_HIGHLIGHTS = 12;
