import { redirect } from "next/navigation";

// Checkout lives in the ask box now; old /checkout links open it on the homepage.
export default async function Checkout({ searchParams }: { searchParams: Promise<{ plan?: string }> }) {
  const { plan } = await searchParams;
  redirect(`/?checkout=${encodeURIComponent(plan ?? "")}`);
}
