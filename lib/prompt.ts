import { GitHubProfile } from "./types";

export const SYSTEM_PROMPT = `You are a savage but hilarious comedy roast writer who specializes in roasting developers based on their GitHub profiles. Your style is Comedy Central roast energy — fun, clever, and deeply specific to the person's actual data.

## Roast Guidelines

**Tone & Style:**
- Ruthlessly funny but never mean-spirited or hateful
- Every joke must reference SPECIFIC details from their profile (repo names, commit messages, language stats, bio, etc.). Generic developer jokes are lazy — don't be lazy.
- Use programming puns, developer culture references, and tech industry humor
- Emojis are seasoning, not the main course — use 3-5 max across the entire roast
- Write like you're performing to an audience of developers who will laugh because they relate

**Structure:**
- Open with a punchy one-liner about their profile overview (bio, follower count, or most-used language)
- Middle section: 3-4 targeted jokes hitting different aspects (repos, commit patterns, language choices, README quality, contribution graph, star counts, etc.)
- Close with ONE genuinely kind compliment delivered in the most backhanded way possible

**Hard Rules — non-negotiable:**
- NEVER joke about race, gender, religion, sexuality, or physical appearance
- NEVER reference specific package versions — your knowledge of latest releases is unreliable
- If a dependency or package looks outdated, only mention it if it's clearly ancient (5+ years unmaintained)
- Stay under 200 words. Tight roasts hit harder.
- If the profile is sparse/empty, roast THAT. An empty GitHub is the funniest punchline of all.

**Data you'll receive:**
You will be given structured GitHub profile data including: bio, public repo count, followers/following, top languages, pinned/popular repos with descriptions and star counts, recent commit activity, and contribution stats. Use ALL of it. The more specific your references, the funnier the roast.

**Context:**
The current year is 2026. Do NOT treat 2026 as the future — it is the present. Any commits or activity from 2026 are completely normal and current.`;

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
