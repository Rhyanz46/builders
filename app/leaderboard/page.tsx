import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import Link from "@/app/components/responsive-link";
import { Arrow, SiteFooter, SiteHeader } from "../components/shell";
import { leaderboardIssueUrl, shareCard } from "../content";
import { currentLocale } from "../lib/locale-server";
import { tx, type Locale } from "../lib/locale";
import { site } from "../lib/site";
import { listGitHubActivity } from "../lib/data";
import { readPublicly } from "../lib/public-read";
import { dayKey, leaderboard, type GitHubActivityEntry, type LeaderboardRow } from "../lib/github-activity";

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
 * A made-up board for the preview: invented names, not members, and numbers
 * of no meaning. It only shows the shape the real one will take — points,
 * merged PRs, streaks, badges, repos — and sits blurred behind the lock.
 */
const PREVIEW_ROWS: { name: string; points: number; merged: number; streak: number; badges: string; repos: number; hue: number }[] = [
  { name: "Raka Pratama", points: 1240, merged: 18, streak: 6, badges: "🥇🌍🚀", repos: 7, hue: 262 },
  { name: "Dewi Anggraini", points: 1105, merged: 15, streak: 5, badges: "🌍🚀", repos: 6, hue: 200 },
  { name: "Bima Saputra", points: 980, merged: 13, streak: 4, badges: "🚀⭐", repos: 5, hue: 24 },
  { name: "Sinta Maharani", points: 760, merged: 10, streak: 3, badges: "⭐", repos: 4, hue: 330 },
  { name: "Fajar Nugroho", points: 690, merged: 9, streak: 3, badges: "🌍", repos: 4, hue: 150 },
  { name: "Ayu Lestari", points: 540, merged: 7, streak: 2, badges: "⭐", repos: 3, hue: 45 },
  { name: "Galih Wicaksono", points: 420, merged: 6, streak: 2, badges: "🌱", repos: 3, hue: 280 },
  { name: "Nadia Putri", points: 310, merged: 4, streak: 1, badges: "🌱", repos: 2, hue: 180 },
];

/** How many of this month's real leaders lead the preview, in the clear. */
const REAL_SHOWN = 3;

/**
 * The board as it will look. The first rows are real — this month's leaders
 * by merged PRs, the ranking the activity page already shows — and clear;
 * below them made-up rows fade into a blur, under a "coming soon" lock that
 * points to #186. Points, streaks and badges do not exist yet, so the real
 * rows show a dash there.
 */
async function LivePreview({ locale }: { locale: Locale }) {
  // Today in WIB is read per request, not frozen into the prerendered shell.
  await connection();
  const result = await readPublicly<GitHubActivityEntry[]>("github activity for the leaderboard preview", listGitHubActivity, []);
  const real = leaderboard(result.value, "month", dayKey(new Date(), "Asia/Jakarta")).slice(0, REAL_SHOWN);
  return <LockedPreview locale={locale} real={real} />;
}

function LockedPreview({ locale, real }: { locale: Locale; real: LeaderboardRow[] }) {
  const made = PREVIEW_ROWS.slice(0, PREVIEW_ROWS.length - real.length);
  return (
    // The fog starts right under the last real row, so no made-up name is
    // ever read as a member's: the note, the head, then about 49px a row.
    <section className="lb-preview" aria-labelledby="lb-lock-title" style={{ "--lb-clear": `${66 + real.length * 49}px` } as React.CSSProperties}>
      <p className="lb-preview-note">
        {real.length > 0
          ? tx(locale, "Peringkat bulan ini, sejauh ini", "This month's ranking, so far")
          : tx(locale, "Contoh tampilan", "What it will look like")}
      </p>
      <table className="lb-board">
        <thead>
          <tr>
            <th>#</th>
            <th>{tx(locale, "Member", "Member")}</th>
            <th>{tx(locale, "PR merged", "Merged PRs")}</th>
            <th className="lb-wide">Repo</th>
            <th>{tx(locale, "Poin", "Points")}</th>
            <th className="lb-wide">Streak</th>
            <th className="lb-wide">Badge</th>
          </tr>
        </thead>
        <tbody>
          {real.map(({ person, prs, repos }, index) => (
            <tr key={person.id}>
              <td>{["🥇", "🥈", "🥉"][index] ?? index + 1}</td>
              <td>
                {/* eslint-disable-next-line @next/next/no-img-element -- the member's GitHub picture */}
                <img className="lb-avatar" src={`https://github.com/${encodeURIComponent(person.handle)}.png?size=56`} alt="" width={28} height={28} />
                {person.name || `@${person.handle}`}
              </td>
              <td>{prs}</td>
              <td className="lb-wide">{repos}</td>
              <td className="lb-soon-cell">—</td>
              <td className="lb-wide lb-soon-cell">—</td>
              <td className="lb-wide lb-soon-cell">—</td>
            </tr>
          ))}
          {/* Made-up rows from here on, hidden from assistive tech: they only
              show the shape of the board to come, and fade into the blur. */}
          {made.map((row, index) => (
            <tr key={row.name} aria-hidden="true" className="lb-made">
              <td>{["🥇", "🥈", "🥉"][real.length + index] ?? real.length + index + 1}</td>
              <td>
                <span className="lb-avatar" style={{ "--hue": row.hue } as React.CSSProperties}>
                  {row.name.split(" ").map((part) => part[0]).join("")}
                </span>
                {row.name}
              </td>
              <td>{row.merged}</td>
              <td className="lb-wide">{row.repos}</td>
              <td className="lb-points">{row.points.toLocaleString("id-ID")}</td>
              <td className="lb-wide">🔥 {row.streak}</td>
              <td className="lb-wide">{row.badges}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* The fog: no blur at the top, more and more further down. */}
      <div className="lb-fog" aria-hidden="true" />

      <div className="lb-lock">
        <span className="lb-lock-icon" aria-hidden="true">🔒</span>
        <h2 id="lb-lock-title">{tx(locale, "Segera hadir", "Coming soon")}</h2>
        <p>
          {tx(
            locale,
            "Poin, streak, dan badge lagi kami siapkan. Bantu tentukan aturannya.",
            "Points, streaks and badges are on their way. Help decide the rules.",
          )}
        </p>
        <a className="ab-button ab-button-primary" href={leaderboardIssueUrl} target="_blank" rel="noopener noreferrer">
          {tx(locale, "Kasih ide di #186", "Share ideas on #186")} <span aria-hidden="true">↗</span>
        </a>
      </div>
    </section>
  );
}

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
          <p className="lb-soon-badge tone-done">{tx(locale, "Segera hadir", "Coming soon")}</p>
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

        {/* Made-up rows only, until this month's real ones have been read. */}
        <Suspense fallback={<LockedPreview locale={locale} real={[]} />}>
          <LivePreview locale={locale} />
        </Suspense>

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
