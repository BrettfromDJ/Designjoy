import { redirect } from "next/navigation";

// The FAQ lives in the ask box now; old /faqs links open it on the homepage.
export default function Faqs() {
  redirect("/?faq");
}
