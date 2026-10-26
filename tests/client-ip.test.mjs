import assert from "node:assert/strict";
import test from "node:test";
import { rateLimitBucket } from "../app/lib/client-ip.ts";

test("an IPv4 address is its own bucket", () => {
  assert.equal(rateLimitBucket("203.0.113.7"), "203.0.113.7");
  assert.equal(rateLimitBucket(" 203.0.113.7 "), "203.0.113.7");
  assert.equal(rateLimitBucket("::ffff:203.0.113.7"), "203.0.113.7", "IPv4 written as IPv6 is still IPv4");
});

test("an IPv6 connection counts by its /64, however the address is written", () => {
  const bucket = "2001:db8:abcd:12::/64";
  assert.equal(rateLimitBucket("2001:db8:abcd:12::1"), bucket);
  assert.equal(rateLimitBucket("2001:0db8:abcd:0012:ffff:1:2:3"), bucket, "a fresh address in the same /64");
  assert.equal(rateLimitBucket("2001:DB8:ABCD:12:0:0:0:9"), bucket);
  assert.equal(rateLimitBucket("2001:db8:abcd:13::1"), "2001:db8:abcd:13::/64", "the next /64 is somebody else");
  assert.equal(rateLimitBucket("::1"), "0:0:0:0::/64");
  assert.equal(rateLimitBucket("fe80::1%eth0"), "fe80:0:0:0::/64");
  assert.equal(rateLimitBucket("64:ff9b::192.0.2.33"), "64:ff9b:0:0::/64");
});

test("anything that is not an address has no bucket", () => {
  for (const junk of ["", "unknown", "1.2.3", "203.0.113.7, 10.0.0.1", "2001:db8::g"]) assert.equal(rateLimitBucket(junk), null);
});
