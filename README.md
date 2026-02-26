# 🔥 Roast My GitHub

Get a savage AI-powered roast of your GitHub profile.

Enter a GitHub username or profile URL and watch as AI tears apart your repos, commit history, and coding choices — all in good fun.

## Tech Stack

- **Next.js** (App Router + TypeScript)
- **Tailwind CSS** (fire-themed dark UI)
- **DeepSeek v3.2** via OpenRouter
- **Vercel** for deployment

## Getting Started

```bash
npm install
cp .env.example .env.local
# Add your OpenRouter API key to .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and start roasting.

## Environment Variables

| Variable | Description |
|----------|-------------|
| `OPENROUTER_API_KEY` | Your [OpenRouter](https://openrouter.ai/) API key |
