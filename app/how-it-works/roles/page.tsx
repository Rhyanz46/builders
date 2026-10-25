import type { Metadata } from "next";
import { HowItWorks, howItWorksMetadata } from "../how-it-works";

export function generateMetadata(): Promise<Metadata> {
  return howItWorksMetadata("role");
}

export default function HowItWorksRolesPage() {
  return <HowItWorks track="role" />;
}
