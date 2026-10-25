import type { Metadata } from "next";
import Link from "@/app/components/responsive-link";
import { Arrow, SiteFooter, SiteHeader } from "../components/shell";
import { shareCard, waCommunityUrl } from "../content";
import { currentLocale } from "../lib/locale-server";
import { tx, type Locale } from "../lib/locale";
import { prTierLabel, type PRTier } from "../lib/directory";
import { isOss, site } from "../lib/site";

export async function howItWorksMetadata(track: Track): Promise<Metadata> {
  const locale = await currentLocale();
  const title =
    track === "github"
      ? tx(locale, `Cara kerjanya: kode di GitHub — ${site.name}`, `How it works: code on GitHub — ${site.name}`)
      : tx(locale, `Cara kerjanya: peran lain — ${site.name}`, `How it works: other roles — ${site.name}`);
  const description =
    track === "github"
      ? tx(locale, `Dari masuk sampai PR pertamamu di-merge ke repo open source, bareng komunitas ${site.name}.`, `From signing in to your first PR merged into an open source repo, with the ${site.name} community.`)
      : tx(locale, "Bantu produk member sebagai desainer, product, riset, konten, marketing, atau QA, dari masuk sampai jadi bagian timnya.", "Help members' products in design, product, research, content, marketing or QA, from signing in to being on the team.");
  return {
    title,
    description,
    alternates: { canonical: TRACK_PATHS[track] },
    openGraph: shareCard({ title, description, url: TRACK_PATHS[track] }),
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

/**
 * What a step is about, which picks its colour from the directory's own:
 * blue like its links, green like the WA button, amber like its badges, and
 * purple like a merged pull request on /activity.
 */
type Tone = "account" | "wa" | "pick" | "work" | "done";

type Step = {
  tone: Tone;
  title: string;
  body: string;
  action?: { href: string; label: string; external?: boolean };
};

/** The two ways to contribute, named as the directory's tabs name them. */
export type Track = "github" | "role";

/** Where each walk-through lives: one static page per track, so neither waits on the address. */
const TRACK_PATHS: Record<Track, string> = { github: "/how-it-works", role: "/how-it-works/roles" };

/**
 * A first contribution, step by step, naming what there is to press — one
 * walk-through per way of contributing. Its own page so the directory stays
 * the home page's whole job; the header, the About page and /get-started
 * link here.
 */
function steps(track: Track, locale: Locale): Step[] {
  const wa: Step[] = waCommunityUrl
    ? [
        {
          tone: "wa",
          title: tx(locale, "Gabung WA Community", "Join the WA Community"),
          body:
            track === "github"
              ? tx(
                  locale,
                  "Interaksi paling aktif ada di sana: tanya kalau mentok, cari teman yang pernah kontribusi ke repo yang sama, minta review sebelum PR dikirim, dan rayain PR yang di-merge.",
                  "Where most of the talking happens: ask when you are stuck, find somebody who has contributed to the same repo, get a review before your PR goes out, and cheer merged PRs.",
                )
              : tx(
                  locale,
                  "Interaksi paling aktif ada di sana: kenalan sama pemilik produk, tanya soal perannya sebelum ngajuin diri, dan cerita progres kerjaanmu.",
                  "Where most of the talking happens: meet the people behind the products, ask about a role before you offer, and share how your work is going.",
                ),
          action: { href: waCommunityUrl, label: tx(locale, "Gabung WA", "Join on WA"), external: true },
        },
      ]
    : [];

  if (track === "role") {
    return [
      {
        tone: "account",
        title: tx(locale, "Masuk & ceritakan siapa kamu", "Sign in and say who you are"),
        body: tx(
          locale,
          "Isi profesi, keahlian, dan satu kalimat tentang dirimu di profil. Itu yang dilihat pemilik produk waktu kamu ngajuin diri.",
          "Fill in your profession, skills and a line about yourself on your profile. It is what a product's owner looks at when you offer to help.",
        ),
        action: { href: "/signin", label: tx(locale, "Masuk / gabung", "Sign in / join") },
      },
      ...wa,
      {
        tone: "pick",
        title: tx(locale, "Pilih peran", "Pick a role"),
        body: tx(
          locale,
          "Di direktori, tab Peran lain berisi produk member yang lagi cari desainer, product, riset, konten, marketing, atau QA. Tiap kartu nunjukin peran yang dibuka dan perkiraan waktunya.",
          "In the directory, the Other roles tab lists members' products looking for design, product, research, content, marketing or QA help. Each card shows the roles open and roughly how much time they take.",
        ),
        action: { href: "/?track=role", label: tx(locale, "Buka Peran lain", "Open Other roles") },
      },
      {
        tone: "work",
        title: tx(locale, "Ajukan diri", "Offer to help"),
        body: tx(
          locale,
          "Klik \"Ajukan diri\" di kartunya, atau \"Tawarkan bantuan\" di halaman produknya. Pesan WhatsApp ke admin sudah tertulis; admin yang nyambungin kamu ke pemilik produknya.",
          "Press \"Offer to help\" on the card, or on the product's page. The WhatsApp message to the admin is already written; the admin puts you in touch with the product's owner.",
        ),
      },
      {
        tone: "done",
        title: tx(locale, "Kerjakan bareng pemiliknya", "Work on it with the owner"),
        body: tx(
          locale,
          "Begitu pemiliknya nerima, kamu tercatat di tim produk itu, dan produknya muncul di profilmu di bagian \"Membantu di\".",
          "Once the owner takes you on, you are on that product's team, and it shows on your profile under \"Helping on\".",
        ),
      },
    ];
  }

  return [
    {
      tone: "account",
      title: tx(locale, "Masuk pakai GitHub", "Sign in with GitHub"),
      body: tx(
        locale,
        "Lalu di profilmu, centang \"Tampilkan aktivitas GitHub\". Dari situ PR-mu tercatat sendiri: nggak ada yang perlu kamu isi atau laporkan.",
        "Then tick \"Show GitHub activity\" on your profile. From there your PRs are recorded on their own: nothing to fill in or report.",
      ),
      action: { href: "/signin", label: tx(locale, "Masuk / gabung", "Sign in / join") },
    },
    ...wa,
    {
      tone: "pick",
      title: tx(locale, "Pilih repo", "Pick a repo"),
      body: tx(
        locale,
        isOss
          ? "Di direktori, pilih Lokal kalau mau repo yang maintainer-nya ada di komunitas, lalu cari kartu dengan \"Isu pemula\"."
          : "Di direktori, tab Kode di GitHub berisi repo yang nerima PR. Pilih Lokal kalau mau yang maintainer-nya ada di komunitas, lalu cari kartu dengan \"Isu pemula\".",
        isOss
          ? "In the directory, pick Local for repos whose maintainers are in the community, then look for a card with \"Starter issues\"."
          : "In the directory, the Code on GitHub tab lists repos that take PRs. Pick Local for ones whose maintainers are in the community, then look for a card with \"Starter issues\".",
      ),
      action: { href: "/", label: tx(locale, "Buka direktori", "Open the directory") },
    },
    {
      tone: "work",
      title: tx(locale, "Kerjakan, bareng", "Work on it, together"),
      body: tx(
        locale,
        "Ambil satu issue dan kerjakan di GitHub seperti biasa. Mentok? Tanya di grup WA, atau ke teman yang fotonya ada di badge repo itu: mereka udah pernah lewat jalan yang sama.",
        "Take one issue and work on it on GitHub as usual. Stuck? Ask in the WA group, or the friend whose face is on that repo's badge: they have been down the same road.",
      ),
    },
    {
      tone: "done",
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

export async function HowItWorks({ track }: { track: Track }) {
  const locale = await currentLocale();
  const href = (to: Track) => TRACK_PATHS[to];

  return (
    <>
      <SiteHeader returnTo={href(track)} active="how" />

      <main id="main-content" className="ab-page hw-page">
        <header className="ab-intro" aria-labelledby="how-title">
          <h1 id="how-title">{tx(locale, "Cara kerjanya", "How it works")}</h1>
          <p className="hw-lead">
            {track === "github"
              ? tx(
                  locale,
                  `Dari masuk sampai PR pertamamu di-merge. Kontribusinya terjadi di GitHub; ${site.name} bantu kamu nemu repo-nya, nyambungin kamu ke teman yang bisa ditanya, dan nyatat hasilnya.`,
                  `From signing in to your first merged PR. The contribution happens on GitHub; ${site.name} helps you find the repo, connects you with friends to ask, and keeps the record.`,
                )
              : tx(
                  locale,
                  "Bukan programmer? Produk member juga butuh desainer, product, riset, konten, marketing, dan QA. Dari masuk sampai kamu jadi bagian timnya.",
                  "Not a programmer? Members' products need design, product, research, content, marketing and QA too. From signing in to being on the team.",
                )}
          </p>
          {/* Named and ordered as the directory's own tabs. The open source
              site walks through the code path only. */}
          {isOss ? null : (
            <nav className="dx-scope hw-tracks" aria-label={tx(locale, "Cara kontribusi", "How you contribute")}>
              <Link href={href("github")} className={track === "github" ? "is-active" : ""} aria-current={track === "github" ? "page" : undefined}>
                {tx(locale, "Kode di GitHub", "Code on GitHub")}
              </Link>
              <Link href={href("role")} className={track === "role" ? "is-active" : ""} aria-current={track === "role" ? "page" : undefined}>
                {tx(locale, "Peran lain", "Other roles")}
              </Link>
            </nav>
          )}
        </header>

        <ol className="hw-steps">
          {steps(track, locale).map((step, index) => (
            <li key={step.title} className={`hw-step tone-${step.tone}`}>
              <span className="hw-step-mark" aria-hidden="true">{index + 1}</span>
              <div>
                <h2>{step.title}</h2>
                <p>{step.body}</p>
                {step.action ? (
                  step.action.external ? (
                    <a className="hw-link" href={step.action.href} target="_blank" rel="noopener noreferrer">
                      {step.action.label} <span aria-hidden="true">↗</span>
                    </a>
                  ) : (
                    <Link className="hw-link" href={step.action.href}>
                      {step.action.label} <Arrow />
                    </Link>
                  )
                ) : null}
              </div>
            </li>
          ))}
        </ol>

        {/* PR statuses and the badges belong to the code path's cards. */}
        {track === "github" ? (
          <section className="ab-section" aria-labelledby="directory-title">
            <h2 id="directory-title">{tx(locale, "Cara baca kartunya", "Reading a card")}</h2>

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
                  <p>{tx(locale, `Ada member ${site.name} yang PR-nya pernah masuk ke sini. Kamu bisa tanya-tanya ke mereka dulu.`, `A ${site.name} member has landed a PR here before. You can ask them first.`)}</p>
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
        ) : null}

        <p className="hw-more">
          <Link className="ab-more" href="/about#why-together">
            {tx(locale, "Kenapa harus bareng-bareng?", "Why together?")} <Arrow />
          </Link>
          <Link className="ab-more" href="/about">
            {tx(locale, `Tentang ${site.name}`, `About ${site.name}`)} <Arrow />
          </Link>
        </p>
      </main>

      <SiteFooter />
    </>
  );
}
