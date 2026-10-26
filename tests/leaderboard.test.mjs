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
  assert.deepEqual(month.map(({ person: who, merged, repos }) => [who.handle, merged, repos]), [["ana", 3, 2], ["budi", 2, 1]]);

  const week = leaderboard(entries, "week", "2026-10-27");
  assert.deepEqual(week.map(({ person: who, merged }) => [who.handle, merged]), [["budi", 2], ["ana", 1]]);
});

test("a merge late in the evening counts on that day in WIB", () => {
  const ana = person("ana");
  // 30 Sep 18:00 UTC is 1 Oct 01:00 in Jakarta.
  assert.equal(leaderboard([pr(ana, "acme/one", "merged", "2026-09-30T18:00:00Z")], "month", "2026-10-27")[0].merged, 1);
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
