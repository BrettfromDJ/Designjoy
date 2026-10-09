import { LegalPage } from "@/components/LegalPage";
import { termsOfService } from "@/content/legal";

export const metadata = { title: "Terms of Service — Designjoy" };

export default function Terms() {
  return (
    <LegalPage
      doc={termsOfService}
      other={{ label: "Privacy Policy", href: "/privacy" }}
    />
  );
}
