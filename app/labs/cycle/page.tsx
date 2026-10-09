import { CycleApp } from "@/components/labs/CycleApp";

// Full-window, like a design tool: no site nav or ask box here.
export const metadata = {
  title: "Cycle — Designjoy Labs",
  description: "Turn a stack of images into a looping GIF, right in your browser.",
};

export default function Cycle() {
  return <CycleApp />;
}
