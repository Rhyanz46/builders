/**
 * What kind of thing a project is.
 *
 * A different question from `stages.ts` and from the topic tags, and it has to
 * stay that way or the three collapse into one muddled label. A stage says how
 * far the work has got; a topic says what it is about; the type here says why
 * it exists — and, because of that, what joining it actually means for whoever
 * offers to help.
 *
 * That last part is the whole reason this exists. Somebody scanning the board
 * is not only asking "can I do this work"; they are asking "do I want this kind
 * of arrangement". A weekend experiment where nothing is expected of you and a
 * product with paying customers can want the very same role and be completely
 * different things to say yes to. Without this, the only way to find that out
 * was to read the brief and guess.
 *
 * Store the key, never the label — the same rule as `roles.ts`. The Indonesian
 * copy can be rewritten without touching a single row.
 */
export const PROJECT_TYPES = ["pet", "community", "product", "commercial"] as const;

export type ProjectType = (typeof PROJECT_TYPES)[number];

import { tx, type Locale } from "./locale";

export const projectTypeMeta: Record<
  ProjectType,
  {
    label: string;
    /** What the project is. */
    blurb: string;
    /** What contributing to it is like — the part people are really choosing. */
    contribution: string;
    tone: string;
  }
> = {
  pet: {
    label: "Proyek pribadi",
    blurb: "Dibangun sendiri untuk belajar, bereksperimen, dan bersenang-senang.",
    contribution:
      "Santai dan terbuka untuk bereksperimen. Tanpa tenggat dan bayaran—yang kamu dapatkan adalah pengalaman dan hasil karya itu sendiri.",
    tone: "type-pet",
  },
  community: {
    label: "Proyek komunitas",
    blurb: "Dibangun secara terbuka untuk manfaat bersama, bukan demi keuntungan.",
    contribution:
      "Bekerja bersama banyak orang pada sesuatu yang akhirnya dimiliki bersama. Cocok jika kamu ingin karyamu digunakan secara luas.",
    tone: "type-community",
  },
  product: {
    label: "Produk dengan pengguna",
    blurb: "Sudah digunakan orang di luar tim dan belum dimonetisasi.",
    contribution:
      "Yang kamu bangun langsung menjangkau pengguna yang sudah ada. Ada ritme rilis dan tanggung jawab yang mengikutinya.",
    tone: "type-product",
  },
  commercial: {
    label: "Proyek komersial",
    blurb: "Sudah menghasilkan uang atau memang diarahkan ke sana.",
    contribution:
      "Ada uang yang terlibat. Sepakati imbalannya—bayaran, bagi hasil, atau kepemilikan—sebelum mulai.",
    tone: "type-commercial",
  },
};

const PROJECT_TYPE_EN: Record<ProjectType, { label: string; blurb: string; contribution: string }> = {
  pet: {
    label: "Pet project",
    blurb: "Built alone, to learn, try things out, and enjoy it.",
    contribution: "Relaxed, and open to experiment. No deadlines and no pay — what you take away is the experience and the work itself.",
  },
  community: {
    label: "Community project",
    blurb: "Built in the open for shared benefit rather than for profit.",
    contribution: "Work alongside many people, on something everyone ends up owning. A good fit if you want the work used widely.",
  },
  product: {
    label: "Product with users",
    blurb: "Already used by people outside the team, and not monetised.",
    contribution: "What you build reaches users who are already there. That brings a release rhythm, and the responsibility that comes with it.",
  },
  commercial: {
    label: "Commercial project",
    blurb: "Earning money already, or deliberately heading that way.",
    contribution: "There is money involved. Settle what you get — pay, a share, or ownership — before you start.",
  },
};

export function projectTypeBlurb(value: string, locale: Locale = "en"): string {
  return isProjectType(value) ? tx(locale, projectTypeMeta[value].blurb, PROJECT_TYPE_EN[value].blurb) : "";
}

export function isProjectType(value: string): value is ProjectType {
  return (PROJECT_TYPES as readonly string[]).includes(value);
}

/** The visible name, or an empty string when the project has not said. */
export function projectTypeLabel(value: string, locale: Locale = "en"): string {
  return isProjectType(value) ? tx(locale, projectTypeMeta[value].label, PROJECT_TYPE_EN[value].label) : "";
}

/** The badge's colour class, or an empty string when there is no badge to draw. */
export function projectTypeTone(value: string): string {
  return isProjectType(value) ? projectTypeMeta[value].tone : "";
}

/** What joining this kind of project means, for the project page to say out loud. */
export function projectTypeContribution(value: string, locale: Locale = "en"): string {
  return isProjectType(value)
    ? tx(locale, projectTypeMeta[value].contribution, PROJECT_TYPE_EN[value].contribution)
    : "";
}
