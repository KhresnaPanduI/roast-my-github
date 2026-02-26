import { streamText } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { fetchGitHubProfile } from "@/lib/github";
import { GitHubNotFoundError, GitHubRateLimitError } from "@/lib/github";
import { buildRoastPrompt, SYSTEM_PROMPT } from "@/lib/prompt";

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY!,
});

function extractUsername(input: string): string {
  const urlPattern =
    /(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9-]+)\/?$/;
  const match = input.match(urlPattern);
  if (match) return match[1];
  return input;
}

export async function POST(req: Request) {
  const { username: rawInput } = await req.json();

  if (!rawInput || typeof rawInput !== "string") {
    return Response.json({ error: "Username is required" }, { status: 400 });
  }

  const username = extractUsername(rawInput.trim());

  if (
    !username ||
    !/^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/.test(username)
  ) {
    return Response.json(
      { error: "Invalid GitHub username" },
      { status: 400 }
    );
  }

  try {
    const githubData = await fetchGitHubProfile(username);
    const prompt = buildRoastPrompt(githubData);

    const result = streamText({
      model: openrouter("deepseek/deepseek-v3.2"),
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
      temperature: 0.9,
      maxTokens: 1024,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    if (error instanceof GitHubNotFoundError) {
      return Response.json(
        { error: `GitHub user "${username}" not found` },
        { status: 404 }
      );
    }
    if (error instanceof GitHubRateLimitError) {
      return Response.json(
        { error: "GitHub API rate limit exceeded. Try again in a few minutes." },
        { status: 429 }
      );
    }
    console.error("Roast API error:", error);
    return Response.json(
      { error: "Something went wrong. Try again." },
      { status: 500 }
    );
  }
}
