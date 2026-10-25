/**
 * Which of the two sites this build is.
 *
 * One codebase and one database serve two sites:
 *
 *   - `builders` — builders.swegrowth.id, everything: the directory with both
 *     of its tracks, members' products, their roles, proposals and inbox.
 *   - `oss` — oss.swegrowth.id, only the open source side: the directory's
 *     code track, the Activity page, the repo catalogue, people's open source
 *     records. Nothing about running a product.
 *
 * Chosen per deploy with `NEXT_PUBLIC_SITE`, so it is known at build time:
 * pages still prerender and cached reads stay shared, which choosing by the
 * request's host would undo. Unset means `builders`, the site as it was.
 *
 * No Next.js imports, so the unit tests read it directly.
 */

export const SITES = ["builders", "oss"] as const;
export type SiteId = (typeof SITES)[number];

export function siteFrom(value: string | undefined): SiteId {
  return value === "oss" ? "oss" : "builders";
}

const DEFAULT_URLS: Record<SiteId, string> = {
  builders: "https://builders.swegrowth.id",
  oss: "https://oss.swegrowth.id",
};

const NAMES: Record<SiteId, string> = {
  builders: "Builders",
  oss: "swegrowth OSS",
};

export const SITE: SiteId = siteFrom(process.env.NEXT_PUBLIC_SITE);

/** The open source site: no products, roles, proposals or inbox. */
export const isOss = SITE === "oss";

export const site = {
  id: SITE,
  name: NAMES[SITE],
  /** Canonical origin, without a trailing slash. */
  url: siteUrlFor(SITE, process.env.NEXT_PUBLIC_SITE_URL),
};

export function siteUrlFor(id: SiteId, configured: string | undefined): string {
  const value = configured?.trim().replace(/\/+$/, "");
  return value || DEFAULT_URLS[id];
}

/**
 * The builders site's address for a path, for the oss site to link out to the
 * parts it does not have — a product's page, adding a product.
 */
export function builderUrl(path: string): string {
  const base = SITE === "builders" ? site.url : DEFAULT_URLS.builders;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * Where the auth cookies live. Both sites are subdomains of swegrowth.id, so
 * with `NEXT_PUBLIC_COOKIE_DOMAIN=.swegrowth.id` one sign-in serves both.
 * Unset (local development, a preview deploy) keeps them on the host, as
 * before. Handed to every Supabase client as `cookieOptions`.
 */
export const authCookieOptions: { domain: string } | undefined = process.env.NEXT_PUBLIC_COOKIE_DOMAIN?.trim()
  ? { domain: process.env.NEXT_PUBLIC_COOKIE_DOMAIN.trim() }
  : undefined;
