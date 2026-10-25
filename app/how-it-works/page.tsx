import type { Metadata } from "next";
import Link from "@/app/components/responsive-link";
import { Arrow, SiteFooter, SiteHeader } from "../components/shell";
import { shareCard, waCommunityUrl } from "../content";
import { currentLocale } from "../lib/locale-server";
import { tx, type Locale } from "../lib/locale";
import { prTierLabel, type PRTier } from "../lib/directory";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await currentLocale();
  const title = tx(locale, "Cara kerjanya — Builders", "How it works — Builders");
  const description = tx(
    locale,
    "Dari masuk sampai PR pertamamu di-merge: lima langkah kontribusi ke open source bareng komunitas Builders.",
    "From signing in to your first merged PR: five steps to contributing to open source with the Builders community.",
  );
  return {
    title,
    description,
    alternates: { canonical: "/how-it-works" },
    openGraph: shareCard({ title, description, url: "/how-it-works" }),
  };
}

/**
 * What each PR status on a directory card means — the same tiers, in the same
 * order and words, as `prTierLabel` in app/lib/directory.ts. Written out here
 * because "what does this colour mean?" is the first question a card raises.
 */
const TIERS: readonly (readonly [PRTier, string, string])[] = [
  [
    "active",
    "Ada PR dari luar tim yang di-merge dalam 90 hari terakhir. Paling besar kemungkinan PR pertamamu dibaca dan diterima.",
    "A pull request from outside the team was merged in the last 90 days. The best odds that your first PR is read and accepted.",
  ],
  [
    "first",
    "Pemiliknya sudah buka pintu buat PR dan repo-nya masih aktif, tapi belum ada orang luar yang di-merge. Kamu bisa jadi yang pertama.",
    "The owner has opened it to pull requests and the repo is alive, but nobody from outside has been merged yet. You could be the first.",
  ],
  [
    "open",
    "Pemiliknya terbuka buat PR, tapi GitHub belum sempat kami tanya soal siapa saja yang di-merge.",
    "The owner takes pull requests, but we have not heard back from GitHub yet about who gets merged.",
  ],
  [
    "unopened",
    "Kodenya bisa dibaca dan dipelajari, tapi pemiliknya belum bilang siap nerima PR. Tanya dulu sebelum ngirim.",
    "The code is there to read and learn from, but the owner has not said they take PRs. Ask before sending one.",
  ],
  [
    "inactive",
    "Repo-nya di-archive, atau nggak ada push selama 120 hari. PR ke sini kemungkinan besar nggak ada yang baca.",
    "The repo is archived, or nothing has been pushed for 120 days. A PR here will most likely go unread.",
  ],
];

type Step = {
  title: string;
  body: string;
  action?: { href: string; label: string; external?: boolean };
};

/**
 * A first contribution, step by step, naming what there is to press. Its own
 * page so the directory stays the home page's whole job; the home page, the
 * About page and /get-started link here.
 */
function steps(locale: Locale): Step[] {
  return [
    {
      title: tx(locale, "Masuk pakai GitHub", "Sign in with GitHub"),
      body: tx(
        locale,
        "Lalu di profilmu, centang \"Tampilkan aktivitas GitHub\". Dari situ PR-mu tercatat sendiri: nggak ada yang perlu kamu isi atau laporkan.",
        "Then tick \"Show GitHub activity\" on your profile. From there your PRs are recorded on their own: nothing to fill in or report.",
      ),
      action: { href: "/signin", label: tx(locale, "Masuk / gabung", "Sign in / join") },
    },
    ...(waCommunityUrl
      ? [
          {
            title: tx(locale, "Gabung WA Community", "Join the WA Community"),
            body: tx(
              locale,
              "Interaksi paling aktif ada di sana: tanya kalau mentok, cari teman yang pernah kontribusi ke repo yang sama, minta review sebelum PR dikirim, dan rayain PR yang di-merge.",
              "Where most of the talking happens: ask when you are stuck, find somebody who has contributed to the same repo, get a review before your PR goes out, and cheer merged PRs.",
            ),
            action: { href: waCommunityUrl, label: tx(locale, "Gabung WA", "Join on WA"), external: true },
          },
        ]
      : []),
    {
      title: tx(locale, "Pilih project", "Pick a project"),
      body: tx(
        locale,
        "Di direktori, tab Kode di GitHub berisi repo yang nerima PR. Pilih Lokal kalau mau yang maintainer-nya ada di komunitas, lalu cari kartu dengan \"Isu pemula\". Bukan programmer? Tab Peran lain berisi produk member yang lagi cari desainer, product, riset, atau konten.",
        "In the directory, the Code on GitHub tab lists repos that take PRs. Pick Local for ones whose maintainers are in the community, then look for a card with \"Starter issues\". Not a programmer? The Other roles tab lists members' products looking for design, product, research or content help.",
      ),
      action: { href: "/", label: tx(locale, "Buka direktori", "Open the directory") },
    },
    {
      title: tx(locale, "Kerjakan, bareng", "Work on it, together"),
      body: tx(
        locale,
        "Ambil satu issue dan kerjakan di GitHub seperti biasa. Mentok? Tanya di grup WA, atau ke teman yang fotonya ada di badge repo itu: mereka udah pernah lewat jalan yang sama.",
        "Take one issue and work on it on GitHub as usual. Stuck? Ask in the WA group, or the friend whose face is on that repo's badge: they have been down the same road.",
      ),
    },
    {
      title: tx(locale, "PR di-merge, muncul sendiri", "PR merged, shown for you"),
      body: tx(
        locale,
        "Begitu PR-mu di-merge, PR itu muncul di halaman Aktivitas dan di profilmu. Member lain bisa kasih reaksi, dan teman yang lihat jadi ikut berani mulai.",
        "Once your PR is merged, it shows on the Activity page and on your profile. Other members can react, and friends who see it find the nerve to start too.",
      ),
      action: { href: "/activity", label: tx(locale, "Lihat Aktivitas", "See the Activity") },
    },
  ];
}

export default async function HowItWorksPage() {
  const locale = await currentLocale();

  return (
    <>
      <SiteHeader returnTo="/how-it-works" active="how" />

      <main id="main-content" className="ab-page">
        <header className="ab-intro" aria-labelledby="how-title">
          <h1 id="how-title">{tx(locale, "Cara kerjanya", "How it works")}</h1>
          <p className="ab-lead hw-lead">
            {tx(
              locale,
              "Dari masuk sampai PR pertamamu di-merge. Kontribusinya terjadi di GitHub; Builders bantu kamu nemu project-nya, nyambungin kamu ke teman yang bisa ditanya, dan nyatat hasilnya.",
              "From signing in to your first merged PR. The contribution happens on GitHub; Builders helps you find the project, connects you with friends to ask, and keeps the record.",
            )}
          </p>
        </header>

        <ol className="hw-steps">
          {steps(locale).map((step, index) => (
            <li key={step.title} className="hw-step">
              <span className="hw-step-mark" aria-hidden="true">{index + 1}</span>
              <div>
                <h2>{step.title}</h2>
                <p>{step.body}</p>
                {step.action ? (
                  step.action.external ? (
                    <a className="ab-button" href={step.action.href} target="_blank" rel="noopener noreferrer">
                      {step.action.label} <span aria-hidden="true">↗</span>
                    </a>
                  ) : (
                    <Link className="ab-button" href={step.action.href}>
                      {step.action.label} <Arrow />
                    </Link>
                  )
                ) : null}
              </div>
            </li>
          ))}
        </ol>

        <section className="ab-section" aria-labelledby="directory-title">
          <h2 id="directory-title">{tx(locale, "Cara pakai direktorinya", "How the directory works")}</h2>
          <p className="ab-lead">
            {tx(
              locale,
              "Halaman depan Builders adalah direktori project yang lagi nerima kontributor. Ada dua jalur, dan kamu tinggal pilih yang paling cocok sama keahlianmu.",
              "Builders' front page is a directory of projects taking contributors right now. There are two paths; pick the one that fits what you do.",
            )}
          </p>

          <div className="ab-cards ab-cards-two">
            <Link className="ab-card" href="/">
              <h3>{tx(locale, "Kode di GitHub", "Code on GitHub")}</h3>
              <p>
                {tx(
                  locale,
                  "Repo open source dan project member yang punya repo GitHub. Pilih Lokal untuk yang dikelola komunitas atau maintainer Indonesia, Global untuk sisanya. Tiap kartu nunjukin bahasa, bintang, isu pemula, dan status PR-nya.",
                  "Open source repos and members' projects with a GitHub repo. Pick Local for those run by the community or by Indonesian maintainers, Global for the rest. Each card shows the language, stars, starter issues, and PR status.",
                )}
              </p>
            </Link>
            <Link className="ab-card" href="/?track=role">
              <h3>{tx(locale, "Peran lain", "Other roles")}</h3>
              <p>
                {tx(
                  locale,
                  "Project member yang lagi cari desainer, PM, peneliti, marketing, QA, dan peran lain. Klik “Tawarkan bantuan” di peran yang cocok, dan admin bakal nyambungin kamu ke pemilik project lewat WhatsApp.",
                  "Members' projects looking for designers, PMs, researchers, marketers, QA, and more. Press “Offer to help” on the role that fits, and an admin connects you with the project's owner on WhatsApp.",
                )}
              </p>
            </Link>
          </div>

          <h3 className="ab-subhead">{tx(locale, "Arti status PR", "What the PR status means")}</h3>
          <p className="ab-lead">
            {tx(
              locale,
              "Bukan sekadar centang dari pemiliknya. Status ini dihitung dari GitHub dan diperbarui tiap beberapa jam.",
              "Not just a box the owner ticked. It is worked out from GitHub and refreshed every few hours.",
            )}
          </p>
          <ul className="ab-list">
            {TIERS.map(([tier, bodyId, bodyEn]) => (
              <li key={tier}>
                <span className={`dx-tier-dot dx-tier-dot-${tier}`} aria-hidden="true" />
                <div>
                  <strong>{prTierLabel(tier, locale)}</strong>
                  <p>{tx(locale, bodyId, bodyEn)}</p>
                </div>
              </li>
            ))}
          </ul>

          <h3 className="ab-subhead">{tx(locale, "Tanda di kartu", "The signs on a card")}</h3>
          <ul className="ab-list">
            <li>
              <span className="ab-sign" aria-hidden="true">✓</span>
              <div>
                <strong>{tx(locale, "Teman kita pernah kontribusi", "Friends have contributed")}</strong>
                <p>{tx(locale, "Ada member Builders yang PR-nya pernah masuk ke sini. Kamu bisa tanya-tanya ke mereka dulu.", "A Builders member has landed a PR here before. You can ask them first.")}</p>
              </div>
            </li>
            <li>
              <span className="ab-sign" aria-hidden="true">●</span>
              <div>
                <strong>{tx(locale, "Ada di grup kita", "In our group")}</strong>
                <p>{tx(locale, "Maintainer-nya ada di komunitas kita, jadi PR pertamamu dibaca orang yang kenal kamu.", "The maintainer is in our community, so your first PR is read by someone who knows you.")}</p>
              </div>
            </li>
            <li>
              <span className="ab-sign" aria-hidden="true">🇮🇩</span>
              <div>
                <strong>{tx(locale, "Maintainer Indonesia", "Indonesian maintainers")}</strong>
                <p>{tx(locale, "Repo-nya dikelola orang Indonesia. Masuk hitungan Lokal, walaupun bukan buatan komunitas kita.", "The repo is maintained by Indonesians. It counts as Local, even when it is not one of the community's own.")}</p>
              </div>
            </li>
            <li>
              <span className="ab-sign" aria-hidden="true">☆</span>
              <div>
                <strong>Star</strong>
                <p>{tx(locale, "Suka sama repo-nya? Tombol Star membuka repo itu di GitHub, tempat kamu bisa kasih bintang.", "Like a repo? The Star button opens it on GitHub, where you can star it.")}</p>
              </div>
            </li>
          </ul>
        </section>

        <p className="hw-more">
          <Link className="ab-more" href="/about#why-together">
            {tx(locale, "Kenapa harus bareng-bareng?", "Why together?")} <Arrow />
          </Link>
          <Link className="ab-more" href="/about">
            {tx(locale, "Tentang Builders", "About Builders")} <Arrow />
          </Link>
        </p>
      </main>

      <SiteFooter />
    </>
  );
}
