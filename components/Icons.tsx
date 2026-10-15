// Stand-ins for the Figma icon assets (checkmark). Replace
// with the exported SVGs from the Figma file once they can be downloaded.

/** Marks a plan feature that's added on top of another plan's. */
export function PlusIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 7.5v9M7.5 12h9" pathLength={1} stroke="#7a7878" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function CheckIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m7.5 12.5 3 3 6-7" pathLength={1} stroke="#7a7878" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
