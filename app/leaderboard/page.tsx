import type { Metadata } from "next";
import Link from "@/app/components/responsive-link";
import { Arrow, SiteFooter, SiteHeader } from "../components/shell";
import { leaderboardIssueUrl, shareCard } from "../content";
import { currentLocale } from "../lib/locale-server";
import { tx } from "../lib/locale";
import { site } from "../lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await currentLocale();
  const title = tx(locale, `Leaderboard — ${site.name}`, `Leaderboard — ${site.name}`);
  const description = tx(
    locale,
    "Papan peringkat kontributor open source komunitas swegrowth. Segera hadir—kasih idemu di issue-nya.",
    "A leaderboard of the swegrowth community's open source contributors. Coming soon—share your ideas on the issue.",
  );
  return {
    title,
    description,
    alternates: { canonical: "/leaderboard" },
    openGraph: shareCard({ title, description, url: "/leaderboard" }),
  };
}

/** What is being worked out on #186: [title id, title en, body id, body en]. */
const PLANNED: [string, string, string, string][] = [
  [
    "Poin dari PR merged",
    "Points for merged PRs",
    "PR yang di-merge ke repo orang lain jadi dasar skornya, jadi PR spam nggak dapat apa-apa.",
    "Pull requests merged into other people's repos are the base of the score, so spam PRs earn nothing.",
  ],
  [
    "Streak",
    "Streaks",
    "Kontribusi beberapa minggu berturut-turut dihargai, bukan cuma satu ledakan sekali.",
    "Contributing several weeks in a row counts for more than one burst.",
  ],
  [
    "Badge & milestone",
    "Badges & milestones",
    "PR pertama di-merge, PR pertama ke repo global, kontribusi ke 5 repo, dan seterusnya.",
    "First merged PR, first PR to a global repo, five repos contributed to, and so on.",
  ],
  [
    "Lokal & global, mingguan & sepanjang masa",
    "Local & global, weekly & all-time",
    "Peringkat bisa dilihat per repo lokal atau global, per minggu, per bulan, atau sepanjang masa.",
    "Rankings by local or global repos, by week, by month, or all-time.",
  ],
];

/**
 * The leaderboard, before it exists.
 *
 * Points, streaks and badges are still being worked out on #186, so this page
 * says what is planned and asks for ideas there. Until then the activity page
 * (`/`) keeps a simple ranking — merged PRs this month or this week — beside
 * its feed; this page points to it.
 */
export default async function LeaderboardPage() {
  const locale = await currentLocale();

  return (
    <>
      <SiteHeader returnTo="/leaderboard" />

      <main id="main-content" className="ab-page lb-soon">
        <header className="ab-intro" aria-labelledby="leaderboard-title">
          <p className="lb-soon-badge">{tx(locale, "Segera hadir", "Coming soon")}</p>
          <h1 id="leaderboard-title">
            <span aria-hidden="true">🏆</span> Leaderboard
          </h1>
          <div className="ab-story">
            <p>
              {tx(
                locale,
                "Papan peringkat kontributor open source komunitas swegrowth—dengan poin, streak, dan badge—lagi kami siapkan. Aturan mainnya dibahas terbuka, dan kamu bisa ikut menentukan.",
                "A leaderboard of the swegrowth community's open source contributors—with points, streaks and badges—is on its way. The rules are being worked out in the open, and you can help shape them.",
              )}
            </p>
          </div>
        </header>

        <section className="ab-section" aria-labelledby="planned-title">
          <h2 id="planned-title">{tx(locale, "Yang lagi direncanakan", "What is planned")}</h2>
          <ul className="ab-cards ab-cards-two">
            {PLANNED.map(([titleId, titleEn, bodyId, bodyEn]) => (
              <li key={titleEn} className="ab-card tone-done">
                <h3>{tx(locale, titleId, titleEn)}</h3>
                <p>{tx(locale, bodyId, bodyEn)}</p>
              </li>
            ))}
          </ul>
          <Link className="ab-more" href="/">
            {tx(locale, "Sementara itu, lihat peringkat bulan ini di Aktivitas", "Meanwhile, see this month's ranking on Activity")} <Arrow />
          </Link>
        </section>

        <section className="ab-cta tone-done" aria-labelledby="leaderboard-cta-title">
          <h2 id="leaderboard-cta-title">{tx(locale, "Punya ide? Ikut tentukan.", "Got an idea? Help decide.")}</h2>
          <p>
            {tx(
              locale,
              "Apa yang bikin kamu pengin kontribusi lebih sering? Apa yang terasa “gamey” dengan cara yang nggak enak? Tulis di issue-nya.",
              "What would make you contribute more often? What feels gamey in a bad way? Say it on the issue.",
            )}
          </p>
          <div className="ab-cta-actions">
            <a className="ab-button ab-button-primary" href={leaderboardIssueUrl} target="_blank" rel="noopener noreferrer">
              {tx(locale, "Buka issue #186", "Open issue #186")} <span aria-hidden="true">↗</span>
            </a>
            <Link className="ab-button" href="/">
              {tx(locale, "Lihat aktivitas", "See the activity")}
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
