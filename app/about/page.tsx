import type { Metadata } from "next";
import Link from "@/app/components/responsive-link";
import { Arrow, SiteFooter, SiteHeader } from "../components/shell";
import { shareCard, waCommunityUrl } from "../content";
import { currentLocale } from "../lib/locale-server";
import { tx } from "../lib/locale";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await currentLocale();
  const title = tx(locale, "Tentang — Builders", "About — Builders");
  const description = tx(
    locale,
    "Kontribusi dan bawa dampak, bareng-bareng. Temukan repo open source, lokal maupun global, dan produk buatan builder Indonesia yang siap menerima kontribusimu.",
    "Contribute and deliver impact, together. Find open source repos, local and global, and products by Indonesian builders that are ready for your contribution.",
  );
  return {
    title,
    description,
    alternates: { canonical: "/about" },
    openGraph: shareCard({ title, description, url: "/about" }),
  };
}

/**
 * Who contributes what.
 *
 * Deliberately opened by a programmer-to-programmer example rather than the
 * usual "developers plus everyone else": the point of the page is that the
 * critique already being made in a group chat is the contribution, whoever is
 * making it. The last entry is left open on purpose — a fixed list of roles
 * would say the opposite of what the section is for.
 */
const ROLES: readonly (readonly [string, string, string, string])[] = [
  [
    "Programmer ke programmer",
    "Programmer to programmer",
    "Lihat performa web temennya kureng, nemu bug atau celah security-nya. Daripada jadi bahan ghibah di grup, mending gas contribute ke projectnya.",
    "You notice a friend's site is sluggish, or you spot a bug or a security hole. Instead of turning it into group-chat gossip, go contribute to the project.",
  ],
  [
    "Product manager",
    "Product manager",
    "Value proposition-nya masih ngambang? Bantu tulis ulang: ini masalah siapa, dan kenapa mereka mau pakai produknya.",
    "Value proposition still vague? Help rewrite it: whose problem this is, and why they would want to use the product.",
  ],
  [
    "Designer",
    "Designer",
    "Alur daftarnya kepanjangan? Kasih satu flow yang lebih pendek.",
    "Sign-up flow running long? Hand over a shorter one.",
  ],
  [
    "Marketing",
    "Marketing",
    "Produknya bagus tapi nggak ada yang tahu. Bantu rapiin distribusinya.",
    "The product is good but nobody knows it exists. Help tidy up its distribution.",
  ],
  [
    "Tim data",
    "Data team",
    "Bantu bikin pipeline datanya, lalu propose analisa yang bikin keputusan berikutnya lebih jelas.",
    "Build the data pipeline, then propose the analysis that makes the next decision obvious.",
  ],
  [
    "Peran kamu",
    "Your role",
    "Apalagi? Masih banyak. Kalau peranmu belum ada di daftar ini, besar kemungkinan ada project di sini yang lagi butuh.",
    "What else? Plenty. If your role is not on this list, chances are a project here still needs it.",
  ],
];

/**
 * Why the circle helps, not only the list: what being among people doing the
 * same thing gives you that a directory alone does not. Each point is
 * something the site already does — the friend badge, maintainers in the
 * group, the Activity feed — said as what it means for you.
 */
const TOGETHER: readonly (readonly [string, string, string, string])[] = [
  [
    "Ada yang udah duluan",
    "Someone has been there",
    "Kalau ada teman yang pernah kontribusi ke repo itu, kamu bisa tanya langsung: setup-nya gimana, maintainer-nya suka PR yang kayak apa.",
    "When a friend has contributed to that repo, you can just ask them: how the setup goes, what kind of PR its maintainers like.",
  ],
  [
    "PR-mu dibaca orang yang kenal kamu",
    "Your PR is read by someone who knows you",
    "Banyak maintainer-nya ada di komunitas ini, jadi PR pertamamu nggak tenggelam di antrean orang asing.",
    "Many of the maintainers are in this community, so your first PR does not sink in a queue of strangers.",
  ],
  [
    "Kelihatan, lalu nular",
    "Seen, then catching",
    "Tiap PR yang di-merge muncul di halaman Aktivitas. Lihat teman ngirim PR minggu ini bikin kamu pengin nyoba juga.",
    "Every merged PR shows on the Activity page. Seeing a friend send a PR this week makes you want to try too.",
  ],
  [
    "Dua arah",
    "Both ways",
    "Kontributor dapat pengalaman dan rekam jejak yang nyata. Maintainer dan builder dapat bantuan yang selama ini nggak kunjung datang.",
    "Contributors get real experience and a real track record. Maintainers and builders get the help that never used to come.",
  ],
];

/** Who the place is for. Plain on purpose: what each gets, not a pitch. */
/** Who the place is for: the builder, then contributors — engineers first. */
/** Who the place is for: contributors first — engineers, then every other role — and builders listing a project. */
/** Each point's colour, in TOGETHER's order: a friend's badge, a known reviewer, the Activity feed, both sides helped. */
const TOGETHER_TONES = ["tone-pick", "tone-account", "tone-done", "tone-wa"];

/** Engineers in the code path's blue, other roles in the badges' amber, builders in a result's purple. */
const AUDIENCE_TONES = ["tone-account", "tone-pick", "tone-done"];

const AUDIENCES: readonly (readonly [string, string, string, string])[] = [
  [
    "Engineer",
    "Engineers",
    "Cari repo yang beneran nerima PR, lokal maupun global, lengkap dengan bahasa, isu pemula, dan status PR-nya.",
    "Find repos that genuinely take PRs, local or global, with their language, starter issues and PR status.",
  ],
  [
    "Peran lain",
    "Every other role",
    "Desain, produk, riset, penulisan, marketing, QA—project dari builder Indonesia juga nyari semua itu. Lihat mana yang lagi buka peranmu.",
    "Design, product, research, writing, marketing, QA—projects from Indonesian builders look for all of it. See which are opening your role.",
  ],
  [
    "Builder",
    "Builders",
    "Punya project, open source atau bukan? Daftarin di sini dan buka peran yang kamu cari, biar kontributor bisa nemu.",
    "Building a project, open source or not? List it here and open the roles you are looking for, so contributors can find it.",
  ],
];

const FAQ: readonly (readonly [string, string, string, string])[] = [
  [
    "Builders itu apa?",
    "What is Builders?",
    "Platform komunitas swegrowth buat nemuin project yang terbuka buat kontributor—repo open source maupun produk dari builder Indonesia—berkontribusi, dan bikin kontribusinya kelihatan.",
    "The swegrowth community's platform for finding projects open to contributors—open source repos and products from Indonesian builders—contributing, and making that contribution visible.",
  ],
  [
    "Bedanya Builders sama WA Community?",
    "How is Builders different from the WA Community?",
    "WA Community itu tempat ngobrol: tanya soal issue, cari reviewer, kabar terbaru. Builders itu platformnya: daftar project, profilmu, dan kontribusimu yang tercatat. Keduanya saling melengkapi.",
    "The WA Community is where we talk: questions about an issue, finding a reviewer, news. Builders is the platform: the project list, your profile, and your contributions on record. Each needs the other.",
  ],
  [
    "Siapa yang ngelola?",
    "Who runs it?",
    "Komunitas Software Engineer Growth (swegrowth). Kodenya juga open source—kalau nemu yang kurang, kamu bisa langsung kontribusi ke situs ini.",
    "The Software Engineer Growth (swegrowth) community. The code is open source too—if something is missing, you can contribute to this site directly.",
  ],
  [
    "Saya bukan programmer. Masih bisa kontribusi?",
    "I am not a programmer. Can I still contribute?",
    "Bisa. Project member sering nyari desainer, PM, peneliti, penulis, atau marketing—lihat tab “Peran lain” di direktori.",
    "Yes. Members' projects often look for designers, PMs, researchers, writers or marketers—see the “Other roles” tab in the directory.",
  ],
  [
    "Project saya masih ide dan berantakan. Boleh ditaruh?",
    "My project is still a messy idea. Can I post it?",
    "Boleh. Tulis aja masalahnya, buat siapa, dan sekarang sudah sampai mana. Perbarui seiring jalan—jejaknya justru jadi bukti kerjamu.",
    "Yes. Just write down the problem, who it is for, and where it stands today. Update it as it moves—that trail becomes the proof of your work.",
  ],
  [
    "Wajib buka peran, nggak?",
    "Do I have to open a role?",
    "Nggak. Project boleh dibiarin jadi catatan pengembangan publik dulu, dan peran dibuka kapan pun kamu siap nerima bantuan.",
    "No. A project can stay a public build log for as long as you like, and you can open a role whenever you are ready for help.",
  ],
  [
    "Komunitas saya mau ikut. Gimana caranya?",
    "My community wants to join in. How?",
    "Gabung ke WA Community lewat tombol di bawah, lalu kabarin admin. Ceritain komunitasmu, nanti kita obrolin bareng.",
    "Join the WA Community with the button below, then let the admin know. Tell us about your community, and we will work it out together.",
  ],
  [
    "Repo yang saya tahu belum ada. Bisa diusulin?",
    "A repo I know is missing. Can I suggest it?",
    "Bisa. Klik “Tambah project”, pilih “Repo open source”, lalu pilih alasan kenapa repo itu layak. Setelah dicek admin, repo-nya masuk direktori.",
    "Yes. Press “Add a project”, choose “An open source repo”, and pick why it belongs. Once an admin has checked it, the repo joins the directory.",
  ],
  [
    "Kenapa masuknya pakai GitHub?",
    "Why sign in with GitHub?",
    "Karena kebanyakan yang datang ke sini mau kontribusi kode, dan username GitHub-mu langsung terisi di profil. Izin yang diminta cuma email—nggak bisa nyentuh kode atau repo-mu. Lebih suka Google? Tautannya ada di bawah tombol GitHub.",
    "Because most people here come to contribute code, and your GitHub username fills in on your profile. It asks only for your email—nothing that can touch your code or repositories. Prefer Google? The link is just below the GitHub button.",
  ],
  [
    "Berbayar?",
    "Is there a cost?",
    "Nggak. Gratis untuk komunitas.",
    "No. Free for the community.",
  ],
];

export default async function AboutPage() {
  const locale = await currentLocale();

  return (
    <>
      <SiteHeader returnTo="/about" active="about" />

      <main id="main-content" className="ab-page">
        <header className="ab-intro" aria-labelledby="about-title">
          <h1 id="about-title">{tx(locale, "Kontribusi dan bawa dampak, bareng-bareng.", "Contribute and deliver impact, together.")}</h1>
          {/* The problem from both sides, told as the story, then what the place does about it. */}
          <div className="ab-story">
            <p>
              <strong>{tx(locale, "Bikin project sendirian itu melelahkan.", "Building a project alone is exhausting.")}</strong>{" "}
              {tx(
                locale,
                "Maintainer open source nungguin kontributor yang nggak kunjung datang, dan solo builder ngerjain semuanya sendiri—kode, desain, sampai nyari user pertama.",
                "Open source maintainers wait for contributors who never come, and solo builders do everything themselves—the code, the design, even finding the first users.",
              )}
            </p>
            <p>
              <strong>{tx(locale, "Mau kontribusi juga nggak gampang.", "Contributing isn't easy either.")}</strong>{" "}
              {tx(
                locale,
                "Banyak yang pengin nyalurin kemampuannya, tapi nggak tahu project mana yang terbuka, dan harus mulai dari mana.",
                "Plenty of people want to put their skills to use, but don't know which projects are open, or where to start.",
              )}
            </p>
            <p className="ab-quote">
              <span className="ab-quote-lead">{tx(locale, "Builders hadir buat nyambungin keduanya.", "Builders is here to bring the two together.")}</span>
              <strong>
                {tx(
                  locale,
                  "Temukan repo open source, lokal maupun global, dan produk buatan builder Indonesia yang siap menerima kontribusimu.",
                  "Find open source repos, local and global, and products by Indonesian builders that are ready for your contribution.",
                )}
              </strong>
            </p>
            <p>
              {tx(
                locale,
                "Tiap project nunjukin apakah lagi nerima PR, isu mana yang cocok buat mulai, dan peran apa yang dicari. Lagi bikin project sendiri? Tambahin ke direktori.",
                "Each project shows whether it's taking PRs, where to start, and which roles it's looking for. Building something yourself? Add it to the directory.",
              )}
            </p>
          </div>
        </header>

        {/* The question a newcomer actually asks, answered in one sentence before anything else. */}
        <section id="how" className="ab-section" aria-labelledby="how-title">
          <h2 id="how-title">{tx(locale, "Di Builders ini kita ngapain sebenarnya?", "So what do we actually do on Builders?")}</h2>
          <p className="ab-answer">
            {tx(
              locale,
              "Kontribusi ke open source, bareng-bareng. Builders itu komunitas orang yang sama-sama mau aktif di open source: kita nemuin project yang beneran nerima kontributor, ngirim kontribusi ke sana, dan saling lihat progres satu sama lain, biar yang lain ikut berani mulai.",
              "Contributing to open source, together. Builders is a community of people who all want to be active in open source: we find projects that genuinely take contributors, send them contributions, and see each other's progress, so others find the nerve to start too.",
            )}
          </p>
          <p className="ab-lead">
            {tx(
              locale,
              "Builders itu platformnya; komunitasnya Software Engineer Growth (swegrowth). Ukuran yang kita pegang bukan jumlah pendaftar, tapi berapa member yang PR-nya di-merge ke project orang lain tiap bulan.",
              "Builders is the platform; the community behind it is Software Engineer Growth (swegrowth). The number we watch is not sign-ups but how many members get a PR merged into someone else's project each month.",
            )}
          </p>
          <p className="hw-more">
            <Link className="ab-more" href="/how-it-works">
              {tx(locale, "Lihat cara kerjanya", "See how it works")} <Arrow />
            </Link>
            <Link className="ab-more" href="/activity">
              {tx(locale, "Lihat kontribusi member", "See members' contributions")} <Arrow />
            </Link>
          </p>
        </section>

        <section id="why-together" className="ab-section" aria-labelledby="together-title">
          <h2 id="together-title">{tx(locale, "Kenapa harus bareng-bareng?", "Why together?")}</h2>
          <p className="ab-lead">
            {tx(
              locale,
              "Kontribusi ke open source sendirian itu gampang berhenti di tengah jalan: nggak tahu mulai dari mana, PR nggak ada yang review, lama-lama lupa. Di sekumpulan ini, kamu nggak mulai dari nol.",
              "Contributing to open source alone stalls easily: you don't know where to start, nobody reviews your PR, and after a while you forget. In this circle, you don't start from zero.",
            )}
          </p>
          <ul className="ab-cards ab-steps">
            {TOGETHER.map(([titleId, titleEn, bodyId, bodyEn], index) => (
              <li key={titleEn} className={`ab-card ${TOGETHER_TONES[index] ?? ""}`}>
                <h3>{tx(locale, titleId, titleEn)}</h3>
                <p>{tx(locale, bodyId, bodyEn)}</p>
              </li>
            ))}
          </ul>
          <p className="ab-answer">
            {tx(
              locale,
              "Harapannya: makin banyak engineer Indonesia yang rutin kontribusi ke open source, dan project buatan kita nggak lagi dikerjain sendirian.",
              "The hope: more and more Indonesian engineers contributing to open source as a habit, and the projects we build no longer built alone.",
            )}
          </p>
        </section>

        <section className="ab-section" aria-labelledby="audience-title">
          <h2 id="audience-title">{tx(locale, "Buat siapa", "Who it is for")}</h2>
          <ul className="ab-cards">
            {AUDIENCES.map(([titleId, titleEn, bodyId, bodyEn], index) => (
              <li key={titleEn} className={`ab-card ${AUDIENCE_TONES[index] ?? ""}`}>
                <h3>{tx(locale, titleId, titleEn)}</h3>
                <p>{tx(locale, bodyId, bodyEn)}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="ab-section" aria-labelledby="roles-title">
          <h2 id="roles-title">{tx(locale, "Selain kode", "Beyond code")}</h2>
          <p className="ab-lead">
            {tx(
              locale,
              "Sebuah project juga butuh hal lain selain kode supaya bisa dipakai orang. Tiap peran ngelihat hal yang beda, dan semuanya bisa jadi kontribusi.",
              "A project needs more than code before people can use it. Every role sees something different, and all of it can be a contribution.",
            )}
          </p>

          <ul className="ab-cards">
            {ROLES.map(([titleId, titleEn, bodyId, bodyEn]) => (
              <li key={titleEn} className="ab-card">
                <h3>{tx(locale, titleId, titleEn)}</h3>
                <p>{tx(locale, bodyId, bodyEn)}</p>
              </li>
            ))}
          </ul>

          <Link className="ab-more" href="/?track=role">
            {tx(locale, "Lihat project yang lagi cari peran lain", "See projects looking for other roles")} <Arrow />
          </Link>
        </section>

        <section className="ab-section" aria-labelledby="faq-title">
          <h2 id="faq-title">{tx(locale, "Pertanyaan yang sering muncul", "Frequently asked questions")}</h2>

          <div className="ab-faq">
            {FAQ.map(([questionId, questionEn, answerId, answerEn]) => (
              <details key={questionEn}>
                <summary>{tx(locale, questionId, questionEn)}</summary>
                <p>{tx(locale, answerId, answerEn)}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="ab-cta tone-account" aria-labelledby="about-cta-title">
          <h2 id="about-cta-title">{tx(locale, "Mulai dari satu kontribusi.", "Start with one contribution.")}</h2>
          <p>
            {tx(
              locale,
              "Cari project yang pas di direktori. Punya project sendiri? Daftarin juga.",
              "Find a project that fits in the directory. Have one of your own? List it too.",
            )}
          </p>
          <div className="ab-cta-actions">
            <Link className="ab-button ab-button-primary" href="/">
              {tx(locale, "Lihat direktori", "Browse the directory")}
            </Link>
            <Link className="ab-button" href="/submit">
              <span aria-hidden="true">+</span> {tx(locale, "Tambah project", "Add a project")}
            </Link>
            {waCommunityUrl ? (
              <a className="ab-button" href={waCommunityUrl} target="_blank" rel="noopener noreferrer">
                Join WA Community
              </a>
            ) : null}
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
