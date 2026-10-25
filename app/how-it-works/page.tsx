import type { Metadata } from "next";
import { HowItWorks, howItWorksMetadata } from "./how-it-works";

export function generateMetadata(): Promise<Metadata> {
  return howItWorksMetadata("github");
}

export default function HowItWorksPage() {
  return <HowItWorks track="github" />;
}
