// Stand-ins for the Figma icon assets (sparkles, checkmark). Replace
// with the exported SVGs from the Figma file once they can be downloaded.

export function SparklesIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="#b4b4b4" aria-hidden="true">
      <path d="M10 3.5c.4 3.9 2.6 6.1 6.5 6.5-3.9.4-6.1 2.6-6.5 6.5-.4-3.9-2.6-6.1-6.5-6.5 3.9-.4 6.1-2.6 6.5-6.5Z" opacity="0.5" />
      <path d="M17.5 13c.25 2.3 1.45 3.5 3.75 3.75-2.3.25-3.5 1.45-3.75 3.75-.25-2.3-1.45-3.5-3.75-3.75 2.3-.25 3.5-1.45 3.75-3.75Z" opacity="0.5" />
    </svg>
  );
}

export function CheckIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m7.5 12.5 3 3 6-7" stroke="#7a7878" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
