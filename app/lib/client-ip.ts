import { isIP } from "node:net";

/**
 * What one visitor's connection counts as, for a per-visitor limit.
 *
 * An IPv4 address is one visitor. An IPv6 address is not: a home or phone
 * connection is usually handed a whole /64, so anyone can step to a fresh
 * address for every request. Counting by the /64 prefix keeps one connection
 * one bucket. An IPv4 address written as IPv6 (`::ffff:1.2.3.4`) counts as the
 * IPv4 address it is.
 *
 * `null` when `raw` is not an IP address at all.
 */
export function rateLimitBucket(raw: string): string | null {
  // A zone (`fe80::1%eth0`) names the local interface, not the visitor.
  const address = raw.trim().replace(/%.*$/, "");
  const family = isIP(address);
  if (family === 4) return address;
  if (family !== 6) return null;

  const mapped = /^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/i.exec(address);
  if (mapped) return mapped[1];

  // Expand `::` so the first four groups are the first four groups. A trailing
  // dotted quad is two groups; it only ever sits past the prefix.
  const groups = (part: string) => (part ? part.split(":").flatMap((group) => (group.includes(".") ? ["0", "0"] : [group])) : []);
  const [head, tail] = address.split("::");
  const left = groups(head);
  const right = tail === undefined ? [] : groups(tail);
  const full = tail === undefined ? left : [...left, ...Array<string>(8 - left.length - right.length).fill("0"), ...right];
  return `${full.slice(0, 4).map((group) => Number.parseInt(group, 16).toString(16)).join(":")}::/64`;
}
