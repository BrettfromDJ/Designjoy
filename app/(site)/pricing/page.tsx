import { redirect } from "next/navigation";

// Pricing lives in the ask box now; old /pricing links open it on the homepage.
export default function Pricing() {
  redirect("/?pricing");
}
