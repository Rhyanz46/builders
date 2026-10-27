import assert from "node:assert/strict";
import test from "node:test";
import { leaderboard, periodStart } from "../app/lib/github-activity.ts";
import { activityPath, readActivityFilters } from "../app/lib/activity-url.ts";

const person = (handle, name = handle) => ({ id: handle, username: handle, name, handle });
const pr = (who, repo, state, ...ats) => ({
  kind: "pull_request",
  key: `${who.handle}:${repo}:${state}:${ats[0]}`,
  person: who,
  repo,
  url: `https://github.com/${repo}/pull/1`,
  state,
  pullRequests: ats.map((at, index) => ({ url: `https://github.com/${repo}/pull/${index + 1}`, number: index + 1, title: "t", at })),
  at: ats[0],
});

test("a period starts on the 1st of the month or the Monday of the week", () => {
  assert.equal(periodStart("2026-10-27", "month"), "2026-10-01");
  assert.equal(periodStart("2026-10-27", "week"), "2026-10-26", "a Tuesday's week began on Monday");
  assert.equal(periodStart("2026-10-26", "week"), "2026-10-26", "a Monday is its own start");
  assert.equal(periodStart("2026-11-01", "week"), "2026-10-26", "a Sunday's week can begin last month");
});

test("the board counts merged PRs to other people's repos this period, most first", () => {
  const ana = person("ana", "Ana");
  const budi = person("budi", "Budi");
  const cici = person("cici", "Cici");
  const entries = [
    pr(ana, "acme/one", "merged", "2026-10-27T03:00:00Z", "2026-10-20T03:00:00Z"),
    pr(ana, "acme/two", "merged", "2026-10-02T03:00:00Z"),
    pr(budi, "acme/one", "merged", "2026-10-26T03:00:00Z", "2026-10-26T04:00:00Z"),
    pr(budi, "acme/one", "open", "2026-10-27T03:00:00Z"),
    pr(cici, "acme/three", "merged", "2026-09-30T03:00:00Z"),
    { kind: "commit_summary", key: "cici:own", person: cici, commits: 40, merged: 9, repos: [], since: "2026-09-27", at: "2026-10-27T03:00:00Z" },
  ];

  const month = leaderboard(entries, "month", "2026-10-27");
  assert.deepEqual(month.map(({ person: who, prs, repos }) => [who.handle, prs, repos]), [["ana", 3, 2], ["budi", 2, 1]]);

  // PRs in review count when asked for, on the day they were opened; both kinds together too.
  assert.deepEqual(leaderboard(entries, "month", "2026-10-27", ["open"]).map(({ person: who, prs }) => [who.handle, prs]), [["budi", 1]]);
  assert.deepEqual(leaderboard(entries, "month", "2026-10-27", ["merged", "open"]).map(({ person: who, prs }) => [who.handle, prs]), [["ana", 3], ["budi", 3]]);

  const week = leaderboard(entries, "week", "2026-10-27");
  assert.deepEqual(week.map(({ person: who, prs }) => [who.handle, prs]), [["budi", 2], ["ana", 1]]);
});

test("a merge late in the evening counts on that day in WIB", () => {
  const ana = person("ana");
  // 30 Sep 18:00 UTC is 1 Oct 01:00 in Jakarta.
  assert.equal(leaderboard([pr(ana, "acme/one", "merged", "2026-09-30T18:00:00Z")], "month", "2026-10-27")[0].prs, 1);
});

test("ties go to whoever reached more repos", () => {
  const ana = person("ana");
  const budi = person("budi");
  const entries = [pr(ana, "acme/one", "merged", "2026-10-27T03:00:00Z", "2026-10-27T04:00:00Z"), pr(budi, "acme/one", "merged", "2026-10-27T03:00:00Z"), pr(budi, "acme/two", "merged", "2026-10-27T03:00:00Z")];
  assert.deepEqual(leaderboard(entries, "month", "2026-10-27").map(({ person: who }) => who.handle), ["budi", "ana"]);
});

test("the week is in the address only when asked for", () => {
  assert.equal(readActivityFilters(new URLSearchParams("")).board, "month");
  assert.equal(readActivityFilters(new URLSearchParams("board=week")).board, "week");
  assert.equal(readActivityFilters(new URLSearchParams("board=year")).board, "month");
  assert.equal(activityPath({ board: "week" }), "/?board=week");
  assert.equal(activityPath({ board: "month" }), "/");
});

test("the own-work board counts PRs merged into their own repos, commits only breaking ties", async () => {
  const { ownLeaderboard } = await import("../app/lib/github-activity.ts");
  const summary = (who, merged, commits) => ({ kind: "commit_summary", key: `${who.handle}:own`, person: who, commits, merged, repos: [{ repo: `${who.handle}/x`, commits }], since: "2026-09-27", at: "2026-10-27T03:00:00Z" });
  const rows = ownLeaderboard([summary(person("ana"), 2, 5), summary(person("budi"), 2, 40), summary(person("cici"), 0, 90), summary(person("dodi"), 4, 1)]);
  assert.deepEqual(rows.map(({ person: who, prs }) => [who.handle, prs]), [["dodi", 4], ["budi", 2], ["ana", 2]], "no merged PR, no row");
});

test("local and global split pull requests by the directory's local repos", async () => {
  const { inPlace, placeCounts, leaderboard: board } = await import("../app/lib/github-activity.ts");
  const ana = person("ana");
  const local = new Set(["kawan/krs"]);
  const entries = [
    pr(ana, "kawan/krs", "merged", "2026-10-27T03:00:00Z"),
    pr(ana, "odoo/odoo", "merged", "2026-10-27T03:00:00Z", "2026-10-26T03:00:00Z"),
    { kind: "commit_summary", key: "ana:own", person: ana, commits: 3, merged: 1, repos: [], since: "2026-09-27", at: "2026-10-27T03:00:00Z" },
  ];
  assert.deepEqual(placeCounts(entries, local), { all: 2, local: 1, global: 1 });
  assert.equal(inPlace(entries, "all", local).length, 3);
  assert.deepEqual(inPlace(entries, "local", local).map((entry) => entry.repo), ["kawan/krs"]);
  assert.equal(board(inPlace(entries, "global", local), "month", "2026-10-27")[0].prs, 2);
  assert.equal(activityPath({ place: "local" }), "/?place=local");
  assert.equal(readActivityFilters(new URLSearchParams("place=moon")).place, "all");
});

test("one show choice stands for scope and kind, and old links land on the nearest", async () => {
  const { showOf, showFilters } = await import("../app/lib/activity-url.ts");
  const read = (search) => {
    const filters = readActivityFilters(new URLSearchParams(search));
    return [filters.scope, filters.kind, showOf(filters)];
  };
  assert.deepEqual(read(""), ["external", "all", "contributions"]);
  assert.deepEqual(read("show=merged"), ["external", "merged", "merged"]);
  assert.deepEqual(read("scope=own"), ["own", "all", "own"]);
  assert.deepEqual(read("show=commits"), ["own", "all", "own"], "summaries are members' own work");
  assert.deepEqual(read("scope=all&show=open"), ["external", "open", "open"], "both scopes at once is no longer offered");
  assert.deepEqual(read("scope=own&show=merged"), ["own", "all", "own"]);
  for (const show of ["contributions", "merged", "open", "own"]) assert.equal(showOf(showFilters(show)), show);
  assert.equal(activityPath({ ...showFilters("own") }), "/?scope=own");
  assert.equal(activityPath({ ...showFilters("open") }), "/?show=open");
});

test("where PRs went: newest first by default, or by PRs, or by people", async () => {
  const { repoSummaries } = await import("../app/lib/github-activity.ts");
  const ana = person("ana"), budi = person("budi"), cici = person("cici");
  const entries = [
    pr(ana, "big/one", "merged", "2026-10-01T03:00:00Z", "2026-10-02T03:00:00Z", "2026-10-03T03:00:00Z", "2026-10-04T03:00:00Z"),
    pr(ana, "many/hands", "merged", "2026-10-10T03:00:00Z"),
    pr(budi, "many/hands", "open", "2026-10-11T03:00:00Z"),
    pr(cici, "many/hands", "merged", "2026-10-09T03:00:00Z"),
    pr(budi, "new/one", "merged", "2026-10-26T03:00:00Z"),
  ];
  const names = (order) => repoSummaries(entries, order).map(({ repo }) => repo);
  assert.deepEqual(names(), ["new/one", "many/hands", "big/one"]);
  assert.deepEqual(names("prs"), ["big/one", "many/hands", "new/one"]);
  assert.deepEqual(names("people"), ["many/hands", "big/one", "new/one"], "then by PRs");
  const hands = repoSummaries(entries).find(({ repo }) => repo === "many/hands");
  assert.deepEqual(hands.people.map(({ handle }) => handle), ["budi", "ana", "cici"], "the most recent first");
  assert.equal(hands.prs, 3);
  assert.equal(hands.lastAt, "2026-10-11T03:00:00Z");
});
