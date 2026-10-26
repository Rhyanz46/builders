"use client";

import { useEffect, useId, useRef, useState } from "react";

const OPEN_EVENT = "swegrowth:header-menu-open";

/**
 * Keeps the header menus native and keyboard-friendly, then adds the two
 * behaviours that <details> does not provide: click-away closing and making
 * sure the account and mobile menus cannot stay open at the same time.
 */
export function HeaderMenu({
  className,
  summaryClassName,
  summaryLabel,
  summary,
  children,
}: {
  className: string;
  summaryClassName?: string;
  summaryLabel: string;
  summary: React.ReactNode;
  children: React.ReactNode;
}) {
  const id = useId();
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const summaryRef = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    const close = (restoreFocus = false) => {
      const details = detailsRef.current;
      if (!details) return;
      details.open = false;
      setOpen(false);
      if (restoreFocus) summaryRef.current?.focus();
    };

    const onPointerDown = (event: PointerEvent) => {
      if (!detailsRef.current?.contains(event.target as Node)) close();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close(true);
    };
    const onAnotherMenuOpen = (event: Event) => {
      if ((event as CustomEvent<string>).detail !== id) close();
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener(OPEN_EVENT, onAnotherMenuOpen);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener(OPEN_EVENT, onAnotherMenuOpen);
    };
  }, [id, open]);

  return (
    <details
      className={className}
      ref={detailsRef}
      onToggle={(event) => {
        const isOpen = event.currentTarget.open;
        setOpen(isOpen);
        if (isOpen) window.dispatchEvent(new CustomEvent(OPEN_EVENT, { detail: id }));
      }}
      onClick={(event) => {
        const target = event.target as HTMLElement;
        if (!target.closest("summary") && target.closest("a, button:not([data-keep-menu-open])")) {
          requestAnimationFrame(() => {
            if (detailsRef.current) detailsRef.current.open = false;
          });
        }
      }}
    >
      <summary
        aria-expanded={open}
        aria-label={summaryLabel}
        className={summaryClassName}
        ref={summaryRef}
      >
        {summary}
      </summary>
      {children}
    </details>
  );
}
