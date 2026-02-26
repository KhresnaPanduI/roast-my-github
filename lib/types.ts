export interface GitHubUser {
  login: string;
  name: string | null;
  bio: string | null;
  company: string | null;
  location: string | null;
  blog: string | null;
  twitter_username: string | null;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
  avatar_url: string;
  hireable: boolean | null;
}

export interface GitHubRepo {
  name: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  topics: string[];
  archived: boolean;
  fork: boolean;
  updated_at: string;
  created_at: string;
  size: number;
}

export interface GitHubProfile {
  user: GitHubUser;
  repos: GitHubRepo[];
  languageStats: Record<string, number>;
  topLanguages: string[];
  totalStars: number;
  totalForks: number;
  accountAgeDays: number;
  recentActivity: boolean;
  hasReadme: boolean;
}
