"use client";

import { useRouter } from "next/navigation";
import { WA_JOINED_COOKIE } from "../lib/next-steps";

/**
 * The WA Community step's button. Nobody here can see who is in a WhatsApp
 * group, so pressing it is what counts: a year-long cookie, then a refresh
 * so the step reads as done behind the new tab.
 */
export function WaJoinLink({ href, className, children }: { href: string; className: string; children: React.ReactNode }) {
  const router = useRouter();
  return (
    <a
      className={className}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => {
        document.cookie = `${WA_JOINED_COOKIE}=1; path=/; max-age=31536000; samesite=lax`;
        router.refresh();
      }}
    >
      {children}
    </a>
  );
}
