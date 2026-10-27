import assert from "node:assert/strict";
import test from "node:test";

import { pathFor, readFilters, readPage } from "../app/lib/directory-url.ts";

// The tests run as the builders site (no NEXT_PUBLIC_SITE), whose one path is products.
test("an empty address is the site's own path with nothing applied", () => {
  assert.deepEqual(readFilters({}), { track: "role", scope: "", open: "", pr: [], badge: "", facet: [], stage: [], sort: "", q: "" });
  assert.equal(pathFor(readFilters({})), "/directory");
});

test("the server's query object and the browser's URLSearchParams read the same", () => {
  const search = "?track=role&badge=indonesian&facet=Design&q=kopi&page=2";
  const fromObject = readFilters(Object.fromEntries(new URLSearchParams(search)));
  const fromParams = readFilters(new URLSearchParams(search));
  assert.deepEqual(fromObject, fromParams);
  assert.equal(readPage(new URLSearchParams(search)), "2");
});

test("a filtered address survives a round trip, and the page only rides along when asked", () => {
  const filters = readFilters(new URLSearchParams("scope=local&facet=Design&q=kopi"));
  assert.equal(pathFor(filters), "/directory?scope=local&facet=Design&q=kopi");
  assert.deepEqual(readFilters(new URL(pathFor(filters), "https://x.test").searchParams), filters);
  assert.equal(pathFor(filters, 1), pathFor(filters));
  assert.equal(pathFor(filters, 3), "/directory?scope=local&facet=Design&q=kopi&page=3");
});

test("a track in the address is ignored: each site has one path", () => {
  assert.equal(readFilters(new URLSearchParams("track=github")).track, "role");
  assert.equal(pathFor(readFilters(new URLSearchParams("track=github&q=kopi"))), "/directory?q=kopi");
});

test("an old source link still lands on the matching scope", () => {
  assert.equal(readFilters(new URLSearchParams("source=community")).scope, "local");
  assert.equal(readFilters(new URLSearchParams("source=recommended")).scope, "global");
  assert.equal(readFilters(new URLSearchParams("source=recommended&scope=local")).scope, "local");
});

test("unknown values are dropped rather than trusted", () => {
  const filters = readFilters(new URLSearchParams("track=nope&badge=nope&pr=nope&open=nope&source=nope&scope=nope"));
  assert.equal(pathFor(filters), "/directory");
});

test("several chips in a group, and the order, survive a round trip", () => {
  const filters = readFilters(new URLSearchParams("facet=TypeScript&facet=Go&facet=Go&pr=active&pr=nope&phase=live&phase=nope&sort=stars"));
  assert.deepEqual(filters.facet, ["TypeScript", "Go"]);
  assert.deepEqual(filters.pr, ["active"]);
  assert.deepEqual(filters.stage, ["live"]);
  assert.equal(filters.sort, "stars");
  assert.equal(pathFor(filters), "/directory?pr=active&facet=TypeScript&facet=Go&phase=live&sort=stars");
  // The server's query object carries repeats as an array.
  assert.deepEqual(readFilters({ facet: ["TypeScript", "Go"] }).facet, ["TypeScript", "Go"]);
  assert.equal(readFilters(new URLSearchParams("sort=nope")).sort, "");
});
