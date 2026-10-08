import { redirect } from "next/navigation";

// Booking lives in the ask box now; old /intro-call links open it on the homepage.
export default function IntroCall() {
  redirect("/?book");
}
