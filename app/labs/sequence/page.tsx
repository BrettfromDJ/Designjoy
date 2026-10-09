import { SequenceApp } from "@/components/labs/SequenceApp";

// Full-window, like a design tool: no site nav or ask box here.
export const metadata = {
  title: "Sequence — Designjoy Labs",
  description: "Turn a stack of images into a looping GIF, right in your browser.",
};

export default function Sequence() {
  return <SequenceApp />;
}
