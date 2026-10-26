import { isOss } from "./lib/site";

/**
 * The site's mark in the navigation and footer: the builders peak, or on the
 * open source site the pull request its favicon carries.
 */
export function Logo({ className }: { className?: string }) {
  if (isOss) {
    return (
      <svg
        className={className}
        viewBox="-1 -1 26 26"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        focusable="false"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="6" cy="6" r="2.5" />
        <circle cx="6" cy="18" r="2.5" />
        <circle cx="18" cy="18" r="2.5" />
        <path d="M6 8.5v7M18 15.5V10a3 3 0 0 0-3-3h-4M13 4.5 10.5 7 13 9.5" />
      </svg>
    );
  }
  return (
    <svg
      className={className}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M6.8 32C7.6 28 8 24.6 9.4 21.2 11 17 17.2 14.6 20 7.6 22.8 14.6 29 17 30.6 21.2 32 24.6 32.4 28 33.2 32"
        stroke="currentColor"
        strokeWidth="3.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
