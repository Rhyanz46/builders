
export const AVAILABILITY_STATUSES = [
  "open_to_work",
  "open_to_collaboration",
  "open_to_both",
  "not_open",
] as const;

export type AvailabilityStatus = (typeof AVAILABILITY_STATUSES)[number];

export const DEFAULT_AVAILABILITY: AvailabilityStatus = "open_to_collaboration";

export function isAvailabilityStatus(value: string): value is AvailabilityStatus {
  return (AVAILABILITY_STATUSES as readonly string[]).includes(value);
}

/** Keep older profile rows readable while the availability migration rolls out. */
export function availabilityStatus(value: unknown): AvailabilityStatus {
  return typeof value === "string" && isAvailabilityStatus(value)
    ? value
    : DEFAULT_AVAILABILITY;
}

