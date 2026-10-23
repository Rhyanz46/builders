import type { Metadata } from "next";
import Link from "@/app/components/responsive-link";
import { SiteFooter, SiteHeader } from "../components/shell";
import { FeedbackForm } from "../components/feedback-form";
import { GitHubMark } from "../components/github-mark";
import { shareCard, sourceRepo } from "../content";
import { supabaseConfigured } from "../lib/supabase";
import { currentLocale } from "../lib/locale-server";
import { tx } from "../lib/locale";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await currentLocale();
  const title = tx(locale, "Masukan — Builders", "Feedback — Builders");
  const description = tx(
    locale,
    "Ceritakan apa yang error, bikin bingung, atau kamu harap ada di Builders. Tidak perlu punya akun.",
    "Tell us what is broken, what is confusing, or what you wish existed on Builders. No account needed.",
  );
  return {
    title,
    description,
    alternates: { canonical: "/feedback" },
    openGraph: shareCard({ title, description, url: "/feedback" }),
  };
}

/**
 * Where a masukan is written.
 *
 * Open to guests, and it never reads who is looking. Whether somebody is
 * signed in changes nothing this page renders: the database attaches
 * `auth.uid()` when there is one, and the reply address is optional either
 * way. So the page never waits on the auth round trip the way `/new` does —
 * the header streams the visitor in behind its own boundary, and the form
 * ships with the rest of the page.
 *
 * That is also the kinder answer. A form that asks somebody to sign in before
 * reporting that signing in is broken is a form that hears from nobody.
 */
export default async function FeedbackPage() {
  const locale = await currentLocale();

  return (
    <>
      <SiteHeader returnTo="/feedback" active="feedback" />

      <main id="main-content" className="page-narrow feedback-page">
        <p className="eyebrow">
          <span /> {tx(locale, "Masukan", "Feedback")}
        </p>
        <h1>{tx(locale, "Ada yang ganjil? Bilang aja.", "Something off? Just say so.")}</h1>
        <p className="lede">
          {tx(
            locale,
            "Situs ini juga sebuah project yang lagi dibangun, dan masukanmu adalah kontribusi—sama seperti kontribusi lain di sini. Nggak perlu akun, dan nggak perlu rapi.",
            "This site is a project being built too, and your feedback is a contribution—the same as any other one here. No account needed, and no need to be polished.",
          )}
        </p>
        {/* Two ways in, side by side: the form for anyone, an issue for whoever lives on GitHub. */}
        <p className="feedback-github">
          {tx(locale, "Lebih suka lewat GitHub?", "Prefer GitHub?")}{" "}
          <a href={`https://github.com/${sourceRepo}/issues/new`} rel="noreferrer noopener" target="_blank">
            <GitHubMark />
            {tx(locale, "Buka issue", "Open an issue")} <span aria-hidden="true">↗</span>
          </a>
          {tx(locale, "—progresnya bisa kamu pantau di sana.", "—you can follow its progress there.")}
        </p>

        {supabaseConfigured() ? (
          <FeedbackForm />
        ) : (
          <p className="form-error">
            {tx(
              locale,
              "Situs ini belum terhubung ke Supabase sehingga masukan belum dapat dikirim.",
              "This site is not connected to Supabase yet, so feedback cannot be sent.",
            )}
          </p>
        )}

        <aside className="feedback-elsewhere">
          <p>
            {tx(
              locale,
              "Menemukan celah keamanan? Jangan ditulis di sini atau di issue publik—ikuti cara pelaporan di",
              "Found a security hole? Do not write it here or in a public issue — follow the reporting steps in the repository's",
            )}{" "}
            <a
              href={`https://github.com/${sourceRepo}/blob/main/SECURITY.md`}
              rel="noreferrer noopener"
              target="_blank"
            >
              SECURITY.md
            </a>
            {tx(locale, " pada repositori.", ".")}
          </p>
          <p>
            {tx(
              locale,
              "Yang kamu tulis di sini hanya dibaca pengelola, tidak tampil di mana pun. Selengkapnya di",
              "What you write here is read by the maintainers only; it appears nowhere on the site. More in the",
            )}{" "}
            <Link href="/privacy">{tx(locale, "Kebijakan Privasi", "Privacy Policy")}</Link>.
          </p>
        </aside>
      </main>

      <SiteFooter />
    </>
  );
}
