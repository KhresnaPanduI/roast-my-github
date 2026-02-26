import { GitHubProfile } from "./types";

export const SYSTEM_PROMPT = `You are a savage but funny comedy roast writer specializing in roasting developers based on their GitHub profiles. Your style is like a Comedy Central roast — brutal but clever, with jokes that are specific to the person's actual data. Be creative, use programming humor, and reference specific details from their profile. Keep it under 300 words. Use emojis sparingly for effect. End with one genuinely nice compliment buried in a backhanded way.

Rules:
- Be funny, not mean-spirited or offensive
- Never make jokes about race, gender, religion, or personal appearance
- Focus on their code, repos, languages, commit patterns, and GitHub behavior
- Reference specific repo names and stats for personalized humor
- Use programming puns and developer culture references`;

export function buildRoastPrompt(profile: GitHubProfile): string {
  const {
    user,
    repos,
    topLanguages,
    totalStars,
    totalForks,
    accountAgeDays,
    recentActivity,
    hasReadme,
  } = profile;

  const accountAge =
    accountAgeDays > 365
      ? `${Math.floor(accountAgeDays / 365)} years`
      : `${accountAgeDays} days`;

  const topRepos = repos
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 5)
    .map(
      (r) =>
        `  - "${r.name}" (${r.stargazers_count} stars, ${r.forks_count} forks, language: ${r.language || "none"})${r.description ? `: ${r.description}` : ""}`
    )
    .join("\n");

  const recentRepos = repos
    .sort(
      (a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    )
    .slice(0, 3)
    .map(
      (r) =>
        `  - "${r.name}" (last updated: ${r.updated_at.split("T")[0]})`
    )
    .join("\n");

  const archivedCount = repos.filter((r) => r.archived).length;
  const noDescriptionCount = repos.filter((r) => !r.description).length;

  return `Roast this GitHub developer based on their profile data:

**Username:** ${user.login}
**Name:** ${user.name || "Not set"}
**Bio:** ${user.bio || "No bio"}
**Company:** ${user.company || "None listed"}
**Location:** ${user.location || "Unknown"}
**Blog/Website:** ${user.blog || "None"}
**Hireable:** ${user.hireable ? "Yes (desperately)" : "No"}
**Account Age:** ${accountAge}
**Public Repos:** ${user.public_repos}
**Followers:** ${user.followers}
**Following:** ${user.following}
**Total Stars (across repos):** ${totalStars}
**Total Forks:** ${totalForks}
**Top Languages:** ${topLanguages.join(", ") || "None detected"}
**Has Profile README:** ${hasReadme ? "Yes" : "No"}
**Recent Activity (last 90 days):** ${recentActivity ? "Yes" : "No"}
**Archived Repos:** ${archivedCount}
**Repos Without Description:** ${noDescriptionCount} out of ${repos.length}

**Top Repos by Stars:**
${topRepos || "  None worth mentioning"}

**Most Recently Updated:**
${recentRepos || "  Nothing recent"}

Now roast them!`;
}
