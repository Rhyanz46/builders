/**
 * Who may do what on a project.
 *
 * Three levels, and only one of them has a table row of its own:
 *
 *   pemilik  `projects.owner_id` — holds no seat
 *   admin    a filled seat with `access = 'admin'`
 *   anggota  a filled seat
 *
 * These are pure functions over data the project page already holds, so they
 * decide what to *render*. What may actually happen is decided by the row
 * level security policies in `supabase/migrations/0004_access_and_tasks.sql`.
 */
export const PROJECT_ACCESS = ["owner", "admin", "member", "guest"] as const;

export type ProjectAccess = (typeof PROJECT_ACCESS)[number];

type SeatLike = {
  status: string;
  access: string;
  person: { id: string } | null;
};

/** Where this visitor stands on this project. */
export function accessOf(
  viewerId: string | null | undefined,
  ownerId: string,
  seats: SeatLike[],
): ProjectAccess {
  if (!viewerId) return "guest";
  if (viewerId === ownerId) return "owner";

  const seat = seats.find((candidate) => candidate.person?.id === viewerId);
  // A seat only counts once it is actually held. Somebody whose application is
  // still pending is not on the project yet, however it is labelled.
  if (!seat || seat.status !== "filled") return "guest";

  return seat.access === "admin" ? "admin" : "member";
}

/** May open seats, answer applications, and run the task list. */
export function canManage(access: ProjectAccess): boolean {
  return access === "owner" || access === "admin";
}

/** May promote somebody to admin, edit the brief, or delete the project. */
export function isOwner(access: ProjectAccess): boolean {
  return access === "owner";
}
