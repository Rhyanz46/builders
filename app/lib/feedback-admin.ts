import "server-only";

import { createHmac } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";
import type { Supabase } from "./supabase";
import { rateLimitBucket } from "./client-ip";
import { resilientSupabaseFetch } from "./resilient-fetch";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

/**
 * Whether this deployment can take feedback: the project, and the private key
 * the RPC is granted to. A site without the key shows a sentence, not a form
 * that can never send.
 */
export function feedbackConfigured(): boolean {
  return Boolean(url && serviceRoleKey);
}

let feedbackAdmin: Supabase | null = null;

/** A server-only client for the RPC that rejects direct public feedback writes. */
export function getFeedbackAdminSupabase(): Supabase | null {
  if (!feedbackConfigured()) return null;
  feedbackAdmin ??= createClient<Database>(url, serviceRoleKey, {
    global: { fetch: resilientSupabaseFetch },
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  return feedbackAdmin;
}

/**
 * The guest's place in the hourly count: an HMAC of their connection, never
 * the address itself.
 *
 * The connection is Netlify's `x-nf-client-connection-ip`, which Netlify sets
 * and a visitor cannot. Headers a visitor can write (`x-forwarded-for`) are not
 * read: trusting them would let anyone pick a fresh bucket per request. Where
 * that header is missing — `next start`, another host — every guest shares one
 * bucket, so feedback still works there, five an hour between them.
 *
 * Only call once `feedbackConfigured()` is true.
 */
export function guestFingerprint(netlifyClientIp: string | null): string {
  const bucket = (netlifyClientIp && rateLimitBucket(netlifyClientIp)) || "unknown";
  return createHmac("sha256", serviceRoleKey).update(`feedback-guest:${bucket}`).digest("hex");
}
