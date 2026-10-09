import { CyclesApp } from "@/components/labs/CyclesApp";

// Full-window, like a design tool: no site nav or ask box here.
export const metadata = {
  title: "Cycles — Designjoy Labs",
  description: "Turn a stack of images into a looping GIF, right in your browser.",
};

export default function Cycles() {
  return <CyclesApp />;
}
