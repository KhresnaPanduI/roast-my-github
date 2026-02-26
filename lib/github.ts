import { GitHubUser, GitHubRepo, GitHubProfile } from "./types";

export class GitHubNotFoundError extends Error {
  constructor(username: string) {
    super(`GitHub user "${username}" not found`);
    this.name = "GitHubNotFoundError";
  }
}

export class GitHubRateLimitError extends Error {
  constructor() {
    super("GitHub API rate limit exceeded. Try again in a few minutes.");
    this.name = "GitHubRateLimitError";
  }
}

const GITHUB_API = "https://api.github.com";

async function githubFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${GITHUB_API}${path}`, {
    headers: {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "roast-my-github",
    },
  });

  if (res.status === 404) {
    throw new GitHubNotFoundError(path);
  }

  if (
    res.status === 403 &&
    res.headers.get("x-ratelimit-remaining") === "0"
  ) {
    throw new GitHubRateLimitError();
  }

  if (!res.ok) {
    throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
  }

  return res.json() as Promise<T>;
}

async function fetchUser(username: string): Promise<GitHubUser> {
  return githubFetch<GitHubUser>(`/users/${username}`);
}

async function fetchRepos(
  username: string,
  sort: "updated" | "stars",
  perPage: number
): Promise<GitHubRepo[]> {
  return githubFetch<GitHubRepo[]>(
    `/users/${username}/repos?sort=${sort}&per_page=${perPage}&direction=desc`
  );
}

export async function fetchGitHubProfile(
  username: string
): Promise<GitHubProfile> {
  const [user, recentRepos, starredRepos] = await Promise.all([
    fetchUser(username),
    fetchRepos(username, "updated", 30),
    fetchRepos(username, "stars", 10),
  ]);

  // Merge and deduplicate repos, exclude forks
  const repoMap = new Map<string, GitHubRepo>();
  for (const repo of [...recentRepos, ...starredRepos]) {
    if (!repo.fork) {
      repoMap.set(repo.name, repo);
    }
  }
  const repos = Array.from(repoMap.values());

  // Aggregate language stats from primary language field
  const languageStats: Record<string, number> = {};
  for (const repo of repos) {
    if (repo.language) {
      languageStats[repo.language] =
        (languageStats[repo.language] || 0) + repo.size;
    }
  }

  const topLanguages = Object.entries(languageStats)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([lang]) => lang);

  const totalStars = repos.reduce((sum, r) => sum + r.stargazers_count, 0);
  const totalForks = repos.reduce((sum, r) => sum + r.forks_count, 0);

  const accountAgeDays = Math.floor(
    (Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24)
  );

  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  const recentActivity = repos.some(
    (r) => new Date(r.updated_at) > ninetyDaysAgo
  );

  const hasReadme = repos.some(
    (r) => r.name.toLowerCase() === username.toLowerCase()
  );

  return {
    user,
    repos,
    languageStats,
    topLanguages,
    totalStars,
    totalForks,
    accountAgeDays,
    recentActivity,
    hasReadme,
  };
}
