import { LegalPage } from "@/components/LegalPage";
import { privacyPolicy } from "@/content/legal";

export const metadata = { title: "Privacy Policy — Designjoy" };

export default function Privacy() {
  return (
    <LegalPage
      doc={privacyPolicy}
      other={{ label: "Terms of Service", href: "/terms" }}
    />
  );
}
