/**
 * Where a project is in its life.
 *
 * Four levels, not five. Somebody browsing is not looking for "a project that
 * is being validated" — they are looking for something being built that they
 * could help with, so validation is a step in the journey rather than a status
 * of its own, and it lives in the project's updates now.
 *
 * Working alone is not a lesser project — most of the board started that way —
 * so no level asks for a team. What each level asks for is evidence the work
 * has actually moved: something written down, something being worked on right
 * now, something other people can open.
 */
export const STAGES = ["idea", "building", "live", "resting"] as const;

export type Stage = (typeof STAGES)[number];

import { tx, type Locale } from "./locale";

export const stageMeta: Record<Stage, { label: string; labelId: string; blurb: string; blurbId: string; tone: string }> = {
  idea: {
    label: "Idea",
    labelId: "Ide",
    blurb: "Just an idea, but written down seriously and open for discussion.",
    blurbId: "Baru berupa ide, tetapi sudah ditulis dengan serius dan terbuka untuk didiskusikan.",
    tone: "stage-idea",
  },
  building: {
    label: "Building",
    labelId: "Dibangun",
    blurb: "Someone is working on it. Other people cannot use the result yet.",
    blurbId: "Sedang dikerjakan. Hasilnya belum dapat digunakan orang lain.",
    tone: "stage-building",
  },
  live: {
    label: "Live",
    labelId: "Berjalan",
    blurb: "Other people can use it today.",
    blurbId: "Sudah dapat digunakan orang lain saat ini.",
    tone: "stage-live",
  },
  resting: {
    label: "Resting",
    labelId: "Diistirahatkan",
    blurb: "It is not being worked on now. It can be continued or taken over.",
    blurbId: "Sedang tidak dikerjakan. Proyek ini dapat dilanjutkan atau diambil alih.",
    tone: "stage-resting",
  },
};

export function stageLabel(stage: Stage, locale: Locale): string {
  const meta = stageMeta[stage];
  return tx(locale, meta.labelId, meta.label);
}

export function stageBlurb(stage: Stage, locale: Locale): string {
  const meta = stageMeta[stage];
  return tx(locale, meta.blurbId, meta.blurb);
}

export function isStage(value: string): value is Stage {
  return (STAGES as readonly string[]).includes(value);
}

/** Everything a level check needs to know about a project: its evidence. */
export type StageInput = {
  /** What the project is working on right now — see projects.now_text. */
  nowText: string;
  docUrl: string;
  repoUrl: string;
  liveUrl: string;
};

export type Requirement = { label: string; met: boolean };

/**
 * What a project must have to sit at a given level.
 *
 * Evidence only. These used to also ask for a finished brief and a topic, back
 * when no project could exist without both; now that a project can arrive as a
 * link and be written up later, that clause would have parked every live
 * product at "idea" until its owner found time to write three paragraphs — a
 * badge that lies, in the direction that helps nobody.
 *
 * What is left is what the badge actually claims. `building` accepts the
 * "working on now" line as evidence, not only a link: somebody who has just
 * started has nothing to link yet and is still building, and saying out loud
 * what they are working on is the same claim. It is also the one a single row
 * can vouch for, which matters, because the CHECK constraint in the schema
 * enforces the same rule and cannot see other tables.
 *
 * `idea` is the floor and asks for nothing; `resting` is a decision rather
 * than an achievement, so it carries no requirements either.
 */
export function requirementsFor(stage: Stage, project: StageInput, locale: Locale = "en"): Requirement[] {
  switch (stage) {
    case "idea":
      return [];
    case "building":
      return [
        {
          label: tx(locale, "Memuat pekerjaan terkini atau tautan yang dapat diakses", "Includes current work or a working link"),
          met: Boolean(project.nowText || project.repoUrl || project.docUrl || project.liveUrl),
        },
      ];
    case "live":
      return [
        ...requirementsFor("building", project, locale),
        { label: tx(locale, "Memuat tautan yang dapat dibuka orang lain", "Includes a link other people can open"), met: Boolean(project.liveUrl) },
      ];
    case "resting":
      return [];
  }
}

export function meetsStage(stage: Stage, project: StageInput): boolean {
  return requirementsFor(stage, project).every((requirement) => requirement.met);
}

/** Levels the project is allowed to move to right now. */
export function reachableStages(project: StageInput): Stage[] {
  return STAGES.filter((stage) => meetsStage(stage, project));
}

/**
 * The level a project should sit at after an edit.
 *
 * Editing can take away what a level stood on — clearing the live link on a
 * project marked "sudah berjalan", say. Rather than refuse the edit or leave a
 * badge that lies, the project drops to the highest level it still earns.
 * A level that is still earned is never touched, and `resting` is a decision
 * rather than an achievement, so it stays put.
 */
export function settleStage(current: Stage, project: StageInput): Stage {
  if (current === "resting" || meetsStage(current, project)) return current;

  const earned = reachableStages(project).filter((stage) => stage !== "resting");
  return earned.length > 0 ? earned[earned.length - 1] : "idea";
}

/** Parses the comma-separated tag field people type into a clean list. */
export function tagList(tags: string): string[] {
  return tags
    .split(",")
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean);
}
