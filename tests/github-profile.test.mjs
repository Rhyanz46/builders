import assert from "node:assert/strict";
import test from "node:test";

import { buildProfileQuery, buildPullRequestQuery, organisationsOf, parseProfile } from "../app/lib/github-profile.ts";

const pr = (repo, extra = {}) => ({
  title: `Fix ${repo}`,
  url: `https://github.com/${repo}/pull/${extra.number ?? 1}`,
  number: extra.number ?? 1,
  createdAt: "2026-10-20T00:00:00Z",
  mergedAt: extra.mergedAt ?? null,
  isDraft: false,
  authorAssociation: extra.association ?? "CONTRIBUTOR",
  repository: { nameWithOwner: repo, url: `https://github.com/${repo}`, stargazerCount: 10, isPrivate: extra.private ?? false, owner: { login: repo.split("/")[0] } },
});

const profile = {
  data: {
    user: {
      login: "ana",
      databaseId: 42,
      organizations: { nodes: [{ login: "ana-org" }, { login: "bad name" }] },
      pinnedItems: { nodes: [
        { nameWithOwner: "ana/tool", url: "https://github.com/ana/tool", description: "A tool", stargazerCount: 5, isPrivate: false, primaryLanguage: { name: "Go", color: "#00ADD8" } },
        { nameWithOwner: "ana/secret", url: "https://github.com/ana/secret", isPrivate: true },
      ] },
      contributionsCollection: { contributionCalendar: { totalContributions: 500 }, totalCommitContributions: 300, totalPullRequestContributions: 40, totalPullRequestReviewContributions: 7 },
      repositoriesContributedTo: { totalCount: 9 },
    },
  },
};

test("the searches leave out the member's own repos and organisations", () => {
  assert.equal(buildProfileQuery("bad name"), null);
  const orgs = organisationsOf(profile);
  assert.deepEqual(orgs, ["ana-org"]);
  const { variables } = buildPullRequestQuery("ana", orgs);
  assert.match(variables.open, /is:open .*author:ana -user:ana -org:ana-org/);
  assert.match(variables.merged, /is:merged author:ana -user:ana -org:ana-org/);
});

test("open PRs, merged PRs by repo, pinned repos and the year's numbers", () => {
  const pulls = {
    data: {
      open: { nodes: [pr("big/project", { number: 7 }), pr("ana-org/inside", { association: "MEMBER" }), pr("x/private", { private: true })] },
      merged: {
        issueCount: 4,
        nodes: [
          pr("big/project", { number: 1, mergedAt: "2026-10-01T00:00:00Z" }),
          pr("big/project", { number: 2, mergedAt: "2026-10-09T00:00:00Z" }),
          pr("small/lib", { number: 3, mergedAt: "2026-10-05T00:00:00Z" }),
          pr("hidden/org", { number: 4, mergedAt: "2026-10-06T00:00:00Z", association: "MEMBER" }),
        ],
      },
    },
  };
  const result = parseProfile(profile, pulls, 42);
  assert.deepEqual(result.open.map((row) => [row.repo, row.number]), [["big/project", 7]]);
  assert.deepEqual(result.merged.repos.map((row) => [row.repo, row.merged, row.lastMergedAt]), [
    ["big/project", 2, "2026-10-09T00:00:00Z"],
    ["small/lib", 1, "2026-10-05T00:00:00Z"],
  ]);
  // GitHub counted four; one turned out to be their organisation's.
  assert.equal(result.merged.count, 3);
  assert.equal(result.merged.more, false);
  assert.deepEqual(result.pinned.map((row) => row.repo), ["ana/tool"]);
  assert.deepEqual(result.year, { contributions: 500, commits: 300, pullRequests: 40, reviews: 7 });
  assert.equal(result.reposContributedTo, 9);
});

test("an account that is not the linked one shows nothing", () => {
  assert.equal(parseProfile(profile, { data: {} }, 99), null);
  assert.equal(parseProfile({ data: { user: null } }, { data: {} }), null);
});
