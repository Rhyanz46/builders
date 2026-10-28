/**
 * A member's open source work as GitHub tells it, for their profile: the
 * repositories they pinned, the year's contribution counts, the pull requests
 * still open on other people's repositories, and where their merged ones
 * landed.
 *
 * "Other people's" means a repository neither under their own login nor one
 * whose owner they belong to (GitHub's OWNER / MEMBER author association) —
 * the same line /activity draws between contributions and own work.
 *
 * No Next.js or Supabase imports, so tests/github-profile.test.mjs can call
 * these directly; data.ts does the fetching and the caching.
 */

/** How many merged pull requests are read to group by repository. */
export const MERGED_READ = 100;
/** How many open pull requests are read. */
export const OPEN_READ = 30;

export type PinnedRepo = {
  repo: string;
  url: string;
  description: string;
  stars: number;
  language: { name: string; color: string } | null;
};

export type OpenPullRequest = { repo: string; title: string; url: string; number: number; openedAt: string; draft: boolean };

export type MergedRepo = { repo: string; url: string; merged: number; lastMergedAt: string; stars: number };

export type GitHubProfile = {
  login: string;
  pinned: PinnedRepo[];
  /** This year's numbers, from GitHub's contribution calendar. */
  year: { contributions: number; commits: number; pullRequests: number; reviews: number };
  /** Repositories of other people they have opened a pull request to, ever. */
  reposContributedTo: number;
  open: OpenPullRequest[];
  merged: {
    /** Merged pull requests to other people's repositories, all of them. */
    count: number;
    /** More were merged than were read, so `repos` covers the latest ones only. */
    more: boolean;
    repos: MergedRepo[];
  };
};

const INSIDER = new Set(["OWNER", "MEMBER"]);
const HANDLE = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i;

/**
 * The first of two GraphQL requests for one member: who they are, the
 * organisations they belong to — whose repositories count as their own — and
 * the numbers. Null for a login that is not plainly one.
 */
export function buildProfileQuery(login: string): { query: string; variables: Record<string, string> } | null {
  if (!HANDLE.test(login)) return null;
  return {
    query: `query($login: String!) {
  user(login: $login) {
    login
    databaseId
    organizations(first: 100) { nodes { login } }
    pinnedItems(first: 6, types: [REPOSITORY]) {
      nodes { ... on Repository { nameWithOwner url description stargazerCount isPrivate primaryLanguage { name color } } }
    }
    contributionsCollection {
      contributionCalendar { totalContributions }
      totalCommitContributions
      totalPullRequestContributions
      totalPullRequestReviewContributions
    }
    repositoriesContributedTo(first: 1, contributionTypes: [PULL_REQUEST], includeUserRepositories: false) { totalCount }
  }
}`,
    variables: { login },
  };
}

/** The organisations in the first answer, to leave out of the searches. */
export function organisationsOf(body: unknown): string[] {
  const user = (body as { data?: { user?: { organizations?: { nodes?: Array<{ login?: unknown } | null> } } } } | null)?.data?.user;
  return (user?.organizations?.nodes ?? []).flatMap((node) => (typeof node?.login === "string" && HANDLE.test(node.login) ? [node.login] : []));
}

/**
 * The second request: their open and merged pull requests, leaving out their
 * own repositories and their organisations' at the search, so the hundred read
 * are all other people's and the count is GitHub's own.
 */
export function buildPullRequestQuery(login: string, organisations: string[]): { query: string; variables: Record<string, string> } | null {
  if (!HANDLE.test(login)) return null;
  const outside = [`-user:${login}`, ...organisations.filter((org) => HANDLE.test(org)).map((org) => `-org:${org}`)].join(" ");
  const pr = `... on PullRequest { title url number createdAt mergedAt isDraft authorAssociation repository { nameWithOwner url stargazerCount isPrivate owner { login } } }`;
  return {
    query: `query($open: String!, $merged: String!) {
  open: search(type: ISSUE, first: ${OPEN_READ}, query: $open) { nodes { ${pr} } }
  merged: search(type: ISSUE, first: ${MERGED_READ}, query: $merged) { issueCount nodes { ${pr} } }
}`,
    variables: {
      open: `is:pr is:public is:open archived:false author:${login} ${outside} sort:created-desc`,
      merged: `is:pr is:public is:merged author:${login} ${outside} sort:updated-desc`,
    },
  };
}

type Repository = { nameWithOwner?: unknown; url?: unknown; stargazerCount?: unknown; isPrivate?: unknown; owner?: { login?: unknown } | null } | null;
type PullRequestNode = {
  title?: unknown;
  url?: unknown;
  number?: unknown;
  createdAt?: unknown;
  mergedAt?: unknown;
  isDraft?: unknown;
  authorAssociation?: unknown;
  repository?: Repository;
} | null;

/**
 * What GitHub answered, shaped for the profile; null when the account is
 * missing or is not the one linked (`githubId`: a login renamed and then taken
 * by somebody else must not show their work).
 */
export function parseProfile(profileBody: unknown, pullRequestBody: unknown, githubId?: number | null): GitHubProfile | null {
  const user = (profileBody as { data?: { user?: Record<string, unknown> | null } | null } | null)?.data?.user;
  const data = (pullRequestBody as { data?: Record<string, unknown> | null } | null)?.data ?? null;
  if (!user || typeof user.login !== "string") return null;
  if (githubId != null && user.databaseId !== githubId) return null;
  const login = user.login;
  const own = (node: PullRequestNode) => {
    const owner = String(node?.repository?.owner?.login ?? "").toLowerCase();
    return owner === login.toLowerCase() || INSIDER.has(String(node?.authorAssociation ?? ""));
  };
  const usable = (node: PullRequestNode) =>
    Boolean(node && typeof node.url === "string" && typeof node.repository?.nameWithOwner === "string" && node.repository?.isPrivate !== true) && !own(node);

  const pinnedNodes = ((user.pinnedItems as { nodes?: unknown[] } | undefined)?.nodes ?? []) as Array<Record<string, unknown> | null>;
  const pinned: PinnedRepo[] = pinnedNodes.flatMap((node) => {
    if (!node || typeof node.nameWithOwner !== "string" || typeof node.url !== "string" || node.isPrivate === true) return [];
    const language = node.primaryLanguage as { name?: unknown; color?: unknown } | null;
    return [{
      repo: node.nameWithOwner,
      url: node.url,
      description: typeof node.description === "string" ? node.description : "",
      stars: Number(node.stargazerCount) || 0,
      language: language && typeof language.name === "string" ? { name: language.name, color: typeof language.color === "string" ? language.color : "" } : null,
    }];
  });

  const collection = (user.contributionsCollection ?? {}) as Record<string, unknown>;
  const calendar = (collection.contributionCalendar ?? {}) as Record<string, unknown>;
  const year = {
    contributions: Number(calendar.totalContributions) || 0,
    commits: Number(collection.totalCommitContributions) || 0,
    pullRequests: Number(collection.totalPullRequestContributions) || 0,
    reviews: Number(collection.totalPullRequestReviewContributions) || 0,
  };
  const reposContributedTo = Number((user.repositoriesContributedTo as { totalCount?: unknown } | undefined)?.totalCount) || 0;

  const openNodes = (((data?.open as { nodes?: unknown[] } | undefined)?.nodes ?? []) as PullRequestNode[]).filter(usable);
  const open: OpenPullRequest[] = openNodes.map((node) => ({
    repo: String(node!.repository!.nameWithOwner),
    title: String(node!.title ?? ""),
    url: String(node!.url),
    number: Number(node!.number) || 0,
    openedAt: String(node!.createdAt ?? ""),
    draft: node!.isDraft === true,
  }));

  const mergedSearch = (data?.merged ?? {}) as { issueCount?: unknown; nodes?: unknown[] };
  const mergedRead = (mergedSearch.nodes ?? []) as PullRequestNode[];
  const mergedNodes = mergedRead.filter(usable);
  const byRepo = new Map<string, MergedRepo>();
  for (const node of mergedNodes) {
    const repo = String(node!.repository!.nameWithOwner);
    const mergedAt = String(node!.mergedAt ?? "");
    const entry = byRepo.get(repo) ?? { repo, url: String(node!.repository!.url ?? `https://github.com/${repo}`), merged: 0, lastMergedAt: "", stars: Number(node!.repository!.stargazerCount) || 0 };
    entry.merged += 1;
    if (mergedAt > entry.lastMergedAt) entry.lastMergedAt = mergedAt;
    byRepo.set(repo, entry);
  }
  const repos = [...byRepo.values()].sort((a, b) => b.merged - a.merged || b.lastMergedAt.localeCompare(a.lastMergedAt));

  return {
    login,
    pinned,
    year,
    reposContributedTo,
    open,
    merged: {
      // GitHub's count, less any the search let through that were their own
      // after all (an organisation membership the list above could not show).
      count: Math.max(Number(mergedSearch.issueCount) || 0, mergedRead.length) - (mergedRead.length - mergedNodes.length),
      more: Number(mergedSearch.issueCount) > mergedRead.length,
      repos,
    },
  };
}
