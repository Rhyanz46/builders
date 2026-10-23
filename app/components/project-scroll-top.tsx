"use client";

import { Suspense, useLayoutEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * A destination page is a new reading context, so it starts at its top before
 * the browser paints it. Mount this in loading.tsx too when the reset should
 * happen as soon as navigation begins rather than after server data arrives.
 *
 * The boundary is here rather than at each call site: `usePathname()` reads the
 * URL, which is not known while a route is being prerendered, and a page that
 * had to wait for it could not ship a static shell. This component draws
 * nothing, so an empty fallback costs the page nothing while it resolves.
 */
export function PageScrollTop() {
  return (
    <Suspense fallback={null}>
      <ScrollToTopOnNavigation />
    </Suspense>
  );
}

function ScrollToTopOnNavigation() {
  const pathname = usePathname();

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
