"use client";

import { useState } from "react";

/**
 * A banner across the top of a page that its reader can close. Closing it
 * sets a cookie, so the server leaves it out on the next visit too, for
 * `days`; until then it is only hidden here.
 */
export function DismissibleBanner({
  cookie,
  days = 30,
  closeLabel,
  children,
}: {
  cookie: string;
  days?: number;
  closeLabel: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);
  if (!open) return null;

  return (
    <aside className="dx-banner">
      <div className="dx-banner-copy">{children}</div>
      <button
        type="button"
        className="dx-banner-close"
        aria-label={closeLabel}
        onClick={() => {
          document.cookie = `${cookie}=1; path=/; max-age=${days * 86400}; samesite=lax`;
          setOpen(false);
        }}
      >
        <span aria-hidden="true">×</span>
      </button>
    </aside>
  );
}
