import Link from "@/app/components/responsive-link";
import { RelativeTime } from "./relative-time";
import { projectTypeBlurb, projectTypeLabel, projectTypeTone, isProjectType } from "../lib/project-types";
import { projectBlurb } from "../lib/brief";
import { roleLabel } from "../lib/roles";
import { stageBlurb, stageLabel, stageMeta, type Stage } from "../lib/stages";
import type { ActivityEvent, ProjectSummary } from "../lib/data";
import { activityParts } from "../lib/activity";
import { Arrow } from "./shell";
import { currentLocale } from "../lib/locale-server";
import { tx, type Locale } from "../lib/locale";

export async function StageBadge({ stage }: { stage: Stage }) {
  const locale = await currentLocale();
  const meta = stageMeta[stage] ?? stageMeta.idea;
  return (
    <span className={`stage-badge ${meta.tone}`} title={stageBlurb(stage, locale)}>
      <i aria-hidden="true" />
      {stageLabel(stage, locale)}
    </span>
  );
}

/**
 * What kind of project this is, as a pill beside the status badge.
 *
 * Renders nothing at all for a project that has not said. A grey "not stated"
 * chip on every older card would be noise standing in for an answer, and the
 * board already reads as "no badge means nothing was claimed".
 */
export async function TypeBadge({ type }: { type: string }) {
  if (!isProjectType(type)) return null;
  const locale = await currentLocale();

  return (
    <span className={`type-badge ${projectTypeTone(type)}`} title={projectTypeBlurb(type, locale)}>
      {projectTypeLabel(type, locale)}
    </span>
  );
}

/** A project's tags. Plain text: nothing on the site lists projects by tag any more. */
export function TagRow({ tags }: { tags: string[] }) {
  if (tags.length === 0) return null;

  return (
    <ul className="tag-row">
      {tags.map((tag) => (
        <li key={tag}>#{tag}</li>
      ))}
    </ul>
  );
}

/**
 * A project as a row on the board.
 *
 * The order answers the three questions somebody arriving actually has, in the
 * order they have them: what is this, what are they doing about it right now,
 * and could I help. Everything that only measures the project — support count,
 * task tallies, how many stages of four — is either further down or gone.
 * There is no rank number: the board is a place to look around, not a chart.
 */
export async function ProjectRow({ project }: { project: ProjectSummary }) {
  const locale = await currentLocale();
  const helpers = project.activeMemberCount;

  return (
    <li>
      <article className="project-item">
        <div className="project-head">
          <span className={`project-logo level-${project.stage}`} aria-hidden="true">
            {project.glyph || initials(project.title)}
          </span>
          <div>
            <h3>
              {/* Stretched over the whole row — see `.card-cover-link` in
                  globals.css — so a tap anywhere that isn't one of the more
                  specific links below still opens the project. */}
              <Link className="card-cover-link" href={`/projects/${project.slug}`}>
                {project.title}
              </Link>
            </h3>
            <p className="tagline">{projectBlurb(project)}</p>
          </div>
          <div className="project-head-badges">
            <StageBadge stage={project.stage} />
            <TypeBadge type={project.projectType} />
          </div>
        </div>

        <NowLine project={project} />

        {project.openRoles.length > 0 ? (
          <div className="open-call">
            <p className="open-call-head">
              <span className="dot" aria-hidden="true" /> {tx(locale, "Terbuka untuk kontribusi", "Open to contributions")}
            </p>
            <SeatChips roles={project.openRoles} />
          </div>
        ) : null}

        <div className="project-foot">
          <Link className="contributors" href={`/u/${project.owner.username}`}>
            <span className="avatar" aria-hidden="true">
              {initials(project.owner.name)}
            </span>
            <small>
              {project.owner.name}
              {helpers > 0 ? tx(locale, ` + ${helpers} orang`, ` + ${helpers} people`) : ""}
            </small>
          </Link>

          <span className="row-freshness"><Freshness project={project} locale={locale} /></span>

          <Link className="detail-link" href={`/projects/${project.slug}`}>
            {tx(locale, "Lihat", "View")} <Arrow />
          </Link>
        </div>
      </article>
    </li>
  );
}

/**
 * The line that makes a project look alive.
 *
 * A project started a year ago but touched last week is active; one started
 * last week and untouched since is not. Neither of those is something a
 * "created 1 year ago" line can tell you, which is why that line is gone.
 */
export async function NowLine({ project }: { project: ProjectSummary }) {
  if (!project.nowText) return null;
  const locale = await currentLocale();

  return (
    <div className="now-line">
      <p className="now-label">{tx(locale, "Sekarang", "Now")}</p>
      <p className="now-text">{project.nowText}</p>
    </div>
  );
}

/** "Last update 3 days ago" — freshness, which beats any percentage done. */
export function Freshness({ project, locale = "en" }: { project: ProjectSummary; locale?: Locale }) {
  return (
    <>
      {tx(locale, "Pembaruan terakhir ", "Last update ")}
      <RelativeTime value={project.lastActivityAt || project.createdAt} locale={locale} />
    </>
  );
}

export async function SeatChips({
  roles,
  linked = true,
  counts,
  maxVisible,
}: {
  roles: string[];
  linked?: boolean;
  /** Open seats per role. Given one, a chip says how many hands are wanted. */
  counts?: Record<string, number>;
  /** Keep dense contexts readable while still disclosing additional roles. */
  maxVisible?: number;
}) {
  if (roles.length === 0) return null;
  const locale = await currentLocale();
  const shownRoles = maxVisible ? roles.slice(0, maxVisible) : roles;
  const remaining = roles.length - shownRoles.length;

  return (
    <ul className="seat-chips" aria-label={tx(locale, "Bantuan yang dibutuhkan", "Help needed")}>
      {shownRoles.map((role, index) => {
        const many = counts?.[role] ?? 0;
        const label = (
          <>
            {roleLabel(role, "", locale)}
            {many > 0 ? <b> · {many}</b> : null}
          </>
        );

        return (
          <li key={`${role}-${index}`}>
            {linked ? (
              <Link className="seat-chip" href={`/?track=role&facet=${encodeURIComponent(roleLabel(role, "", locale))}`}>
                {label}
              </Link>
            ) : (
              <span className="seat-chip">{label}</span>
            )}
          </li>
        );
      })}
      {remaining > 0 ? (
        <li>
          <span className="seat-chip seat-chip-more" aria-label={tx(locale, `${remaining} peran lainnya tersedia`, `${remaining} more roles available`)}>+{remaining}</span>
        </li>
      ) : null}
    </ul>
  );
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

/** "Mar 2025" — for "aktif sejak" on a profile. */
export function monthYear(value: string, locale: Locale = "en"): string {
  const then = Date.parse(value.includes("T") ? value : value.replace(" ", "T") + "Z");
  if (Number.isNaN(then)) return "";
  return new Intl.DateTimeFormat(locale === "id" ? "id-ID" : "en-US", { month: "short", year: "numeric" }).format(then);
}

/**
 * A trail of what somebody, or a project, has actually done.
 *
 * `hidden` is only ever passed when somebody is looking at their own profile:
 * the SELECT policy on `events` shows them their hidden entries and nobody
 * else's, so this marks them rather than dropping them.
 */
export async function ActivityList({
  events,
  hidden = [],
  showActor = false,
}: {
  events: ActivityEvent[];
  hidden?: string[];
  showActor?: boolean;
}) {
  const locale = await currentLocale();
  return (
    <ol className="activity-list">
      {events.map((event) => {
        const { lead, trail } = activityParts(event, locale);
        const isHidden = hidden.includes(event.kind);
        const gone = event.projectId === null || !event.projectSlug;

        return (
          <li key={event.id} className={isHidden ? "is-hidden" : ""}>
            <p>
              {showActor && event.actor ? (
                <>
                  <Link href={`/u/${event.actor.username}`}>{event.actor.name}</Link>{" "}
                </>
              ) : null}
              {lead}
              {gone ? (
                <strong>{event.projectTitle}</strong>
              ) : (
                <Link href={`/projects/${event.projectSlug}`}>{event.projectTitle}</Link>
              )}
              {trail}
            </p>
            <small>
              <RelativeTime value={event.createdAt} locale={locale} />
              {gone ? tx(locale, " · proyek dihapus", " · project deleted") : ""}
              {isHidden ? tx(locale, " · hanya terlihat olehmu", " · only visible to you") : ""}
            </small>
          </li>
        );
      })}
    </ol>
  );
}
