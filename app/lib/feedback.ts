/**
 * What a masukan may carry, what to say when it does not, and the GitHub issue
 * it becomes.
 *
 * The site stores no feedback. The form on /feedback is a guide to a good
 * issue: it asks the two things a report needs, then opens GitHub's new-issue
 * page with the right template already filled in, and the person sends it
 * from their own account. GitHub keeps the spam out and the thread public, and
 * the maintainers answer where they already work.
 *
 * No Next.js or Supabase imports, so `tests/feedback.test.mjs` can call these
 * directly.
 */

import { tx, type Locale } from "./locale";

/**
 * The five things a masukan turns out to be.
 *
 * Deliberately not a severity scale. What the maintainer needs first is which
 * kind of answer is owed — a fix, a decision, a rewrite of some copy, or
 * nothing at all — and asking for that is one click, where asking somebody to
 * rate their own annoyance is a question they cannot answer.
 */
export const FEEDBACK_KINDS = ["bug", "idea", "confusing", "praise", "other"] as const;

export type FeedbackKind = (typeof FEEDBACK_KINDS)[number];

export const FEEDBACK_LIMITS = {
  /** The ceiling keeps the issue link well under the length GitHub accepts. */
  message: { min: 10, max: 2000 },
} as const;

const FEEDBACK_META: Record<FeedbackKind, { label: string; blurb: string }> = {
  bug: {
    label: "Ada yang error",
    blurb: "Sesuatu tidak jalan, salah tampil, atau gagal disimpan.",
  },
  idea: {
    label: "Usul atau ide",
    blurb: "Ada yang menurutmu perlu ada, atau perlu diubah.",
  },
  confusing: {
    label: "Bikin bingung",
    blurb: "Kamu sempat tersesat atau salah paham di suatu halaman.",
  },
  praise: {
    label: "Ada yang enak dipakai",
    blurb: "Bagian yang sudah pas—biar tidak ikut kena rombak.",
  },
  other: {
    label: "Lainnya",
    blurb: "Tidak masuk keempatnya. Tulis saja apa adanya.",
  },
};

const FEEDBACK_EN: Record<FeedbackKind, { label: string; blurb: string }> = {
  bug: {
    label: "Something is broken",
    blurb: "Something did not work, showed the wrong thing, or failed to save.",
  },
  idea: {
    label: "An idea or a request",
    blurb: "Something you think should exist, or should work differently.",
  },
  confusing: {
    label: "Something confusing",
    blurb: "You got lost, or a page led you to the wrong conclusion.",
  },
  praise: {
    label: "Something that works well",
    blurb: "The parts already worth keeping — so they survive the next rewrite.",
  },
  other: {
    label: "Something else",
    blurb: "None of the four. Say it however you like.",
  },
};

export function isFeedbackKind(value: string): value is FeedbackKind {
  return (FEEDBACK_KINDS as readonly string[]).includes(value);
}

export function feedbackKindLabel(value: string, locale: Locale = "en"): string {
  return isFeedbackKind(value) ? tx(locale, FEEDBACK_META[value].label, FEEDBACK_EN[value].label) : "";
}

export function feedbackKindBlurb(value: string, locale: Locale = "en"): string {
  return isFeedbackKind(value) ? tx(locale, FEEDBACK_META[value].blurb, FEEDBACK_EN[value].blurb) : "";
}

export type FeedbackInput = { kind: string; message: string };
export type FeedbackErrors = Partial<Record<keyof FeedbackInput, string>>;

export const EMPTY_FEEDBACK: FeedbackInput = { kind: "", message: "" };

/**
 * Everything wrong with a masukan, by field.
 *
 * Only the kind and the message are asked for. The floor on the message is the
 * one judgement call here: "error" on its own is not a report anybody can act
 * on. There is no reply address: the issue is the conversation, and GitHub
 * tells whoever opened it when somebody answers.
 */
export function validateFeedback(input: FeedbackInput, locale: Locale = "en"): FeedbackErrors {
  const errors: FeedbackErrors = {};

  if (!isFeedbackKind(input.kind)) {
    errors.kind = tx(locale, "Pilih dulu jenis masukannya.", "Choose what kind of feedback this is.");
  }

  const message = input.message.trim();
  if (!message) {
    errors.message = tx(locale, "Tulis dulu masukanmu.", "Write your feedback first.");
  } else if (message.length < FEEDBACK_LIMITS.message.min) {
    errors.message = tx(
      locale,
      `Ceritakan sedikit lebih panjang—minimal ${FEEDBACK_LIMITS.message.min} karakter.`,
      `Tell us a little more—at least ${FEEDBACK_LIMITS.message.min} characters.`,
    );
  } else if (message.length > FEEDBACK_LIMITS.message.max) {
    errors.message = tx(
      locale,
      `Masukanmu terlalu panjang—maksimal ${FEEDBACK_LIMITS.message.max} karakter.`,
      `Your feedback is too long—at most ${FEEDBACK_LIMITS.message.max} characters.`,
    );
  }

  return errors;
}

/** Where the issue is opened from, filled into it so nobody has to type it. */
export type FeedbackOrigin = {
  /** `owner/name` of the repository the issues go to. */
  repo: string;
  /** The site's host, e.g. `builders.swegrowth.id`. */
  site: string;
  /** The browser's user agent, for a bug's environment. Empty if unknown. */
  userAgent?: string;
};

/**
 * Which issue template each kind opens, and where the message goes in it. The
 * field ids are the `id:`s in `.github/ISSUE_TEMPLATE/`. `blank_issues_enabled`
 * is off there, so every kind needs a template.
 */
const ISSUE_FORMS: Record<FeedbackKind, { template: string; prefix: string; field: string }> = {
  bug: { template: "bug_report.yml", prefix: "[Bug]: ", field: "summary" },
  idea: { template: "feature_request.yml", prefix: "[Idea]: ", field: "problem" },
  confusing: { template: "feedback.yml", prefix: "[Confusing]: ", field: "feedback" },
  praise: { template: "feedback.yml", prefix: "[Praise]: ", field: "feedback" },
  other: { template: "feedback.yml", prefix: "[Feedback]: ", field: "feedback" },
};

/** How much of the message the issue title carries. */
const TITLE_MAX = 72;

/**
 * GitHub's new-issue page for this masukan, with its template, title and
 * fields filled in. Nothing is sent until the person submits it there.
 *
 * Call with input `validateFeedback` accepted.
 */
export function feedbackIssueUrl(input: FeedbackInput, origin: FeedbackOrigin): string {
  const kind: FeedbackKind = isFeedbackKind(input.kind) ? input.kind : "other";
  const form = ISSUE_FORMS[kind];
  const message = input.message.trim().slice(0, FEEDBACK_LIMITS.message.max);
  const firstLine = message.split(/\r?\n/).find((line) => line.trim())?.trim() ?? "";
  const title = firstLine.length > TITLE_MAX ? `${firstLine.slice(0, TITLE_MAX - 1).trimEnd()}…` : firstLine;

  const params = new URLSearchParams({ template: form.template, title: `${form.prefix}${title}`, [form.field]: message });
  if (kind === "bug") {
    params.set("site", origin.site);
    params.set("environment", [origin.site, origin.userAgent].filter(Boolean).join("\n"));
  } else if (form.template === "feedback.yml") {
    params.set("site", origin.site);
  }
  return `https://github.com/${origin.repo}/issues/new?${params.toString()}`;
}
