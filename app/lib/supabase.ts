import { cookies } from "next/headers";
import { connection } from "next/server";
import { cache } from "react";
import { createServerClient } from "@supabase/ssr";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";
import { resilientSupabaseFetch } from "./resilient-fetch";
import { authCookieOptions } from "./site";

export type Supabase = SupabaseClient<Database>;

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/**
 * Whether this deployment has a Supabase project behind it.
 *
 * `false` is a supported state, not a bug: a checkout with no `.env.local`
 * still builds, still renders, and still runs its tests — `app/lib/data.ts`
 * serves the read-only seed instead. Writes refuse loudly; see `requireSupabase`.
 */
export function supabaseConfigured(): boolean {
  return Boolean(url && anonKey);
}

/**
 * A Supabase client carrying the visitor's session.
 *
 * Every query it makes runs as that person, so the row level security policies
 * in `supabase/migrations/0003_policies.sql` are what actually decide who may
 * read and write. The checks in the server actions only exist to turn a refusal
 * into a sentence somebody can read.
 */
export const getSupabase = cache(async (): Promise<Supabase | null> => {
  if (!supabaseConfigured()) return null;

  // `createServerClient` generates PKCE/auth internals with request-scoped
  // randomness. Make that boundary explicit under Cache Components so Next
  // never attempts to evaluate the client while prerendering a public shell.
  await connection();
  const cookieStore = await cookies();

  return createServerClient<Database>(url, anonKey, {
    global: { fetch: resilientSupabaseFetch },
    cookieOptions: authCookieOptions,
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch (error) {
          // Server Components may not set cookies, and for a refreshed token
          // that costs nothing: the proxy writes it on the next request.
          //
          // It is not always free, though. The PKCE code verifier is written
          // once, when a sign-in starts, and a sign-in that loses it fails at
          // the callback with a message about a missing verifier — which reads
          // like a misconfigured redirect URL and is not one. Swallowing that
          // silently is how it stayed invisible, so say it out loud.
          const names = cookiesToSet.map((cookie) => cookie.name).join(", ");
          console.error(`[ahsan] Session cookie could not be written (${names}).`, error);
        }
      },
    },
  });
});

export class SupabaseUnavailableError extends Error {
  constructor() {
    super(
      "Supabase is not configured, so changes cannot be saved. " +
        "Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY, then run the app again.",
    );
    this.name = "SupabaseUnavailableError";
  }
}

export async function requireSupabase(): Promise<Supabase> {
  const supabase = await getSupabase();
  if (!supabase) throw new SupabaseUnavailableError();
  return supabase;
}

/**
 * A Supabase client with no session attached.
 *
 * `use cache` scopes may not touch `cookies()`, so the session-carrying client
 * above cannot be used inside one. This client reads as `anon`, which is
 * exactly the right identity for cached data: everything the cached reads in
 * `data.ts` touch is granted to `anon` with `using (true)` in
 * `supabase/migrations/0003_policies.sql`, so the rows come back identical to
 * what a signed-in visitor would see. The one table where that is not true is
 * `events` — see `listPersonActivity` for how a person's own hidden entries
 * stay visible to them.
 *
 * Built once per server instance rather than per call: it holds no per-visitor
 * state, so there is nothing to rebuild.
 */
let publicClient: Supabase | null = null;

export function getPublicSupabase(): Supabase | null {
  if (!supabaseConfigured()) return null;
  publicClient ??= createClient<Database>(url, anonKey, {
    global: { fetch: resilientSupabaseFetch },
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  return publicClient;
}
