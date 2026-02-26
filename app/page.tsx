"use client";

import { useState, FormEvent } from "react";

export default function Home() {
  const [username, setUsername] = useState("");
  const [roast, setRoast] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!username.trim()) return;

    setRoast("");
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/roast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Something went wrong");
        setIsLoading(false);
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) {
        setError("Failed to read response stream");
        setIsLoading(false);
        return;
      }

      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setRoast(accumulated);
      }

      setIsLoading(false);
    } catch {
      setError("Network error. Please try again.");
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center px-4 py-12 sm:py-20">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-5xl sm:text-7xl font-extrabold fire-gradient mb-4 tracking-tight">
          Roast My GitHub
        </h1>
        <p className="text-text-secondary text-lg sm:text-xl max-w-md mx-auto">
          Enter a GitHub username and get absolutely roasted by AI
        </p>
      </div>

      {/* Input Form */}
      <form
        onSubmit={handleSubmit}
        className="flex flex-col sm:flex-row gap-3 w-full max-w-lg mb-8"
      >
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="octocat or https://github.com/octocat"
          className="flex-1 px-4 py-3 rounded-xl bg-card-bg border border-card-border text-text-primary placeholder:text-text-muted focus:outline-none focus:border-flame-orange focus:ring-1 focus:ring-flame-orange/50 transition-colors font-mono text-sm shadow-sm"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !username.trim()}
          className="px-6 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-flame-orange to-flame-red hover:from-ember hover:to-flame-orange disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-[0_0_20px_rgba(255,107,53,0.3)] active:scale-95 cursor-pointer"
        >
          {isLoading ? "Roasting..." : "🔥 Roast!"}
        </button>
      </form>

      {/* Error Banner */}
      {error && (
        <div className="w-full max-w-2xl mb-6 px-4 py-3 rounded-xl bg-flame-red/5 border border-flame-red/20 text-flame-red text-sm animate-fade-in">
          {error}
        </div>
      )}

      {/* Roast Display */}
      {(roast || isLoading) && (
        <div className="w-full max-w-2xl animate-fade-in">
          <div className="rounded-2xl bg-card-bg border border-card-border p-6 sm:p-8 shadow-sm animate-flicker">
            {isLoading && !roast && (
              <div className="flex items-center gap-3 text-text-secondary">
                <span className="text-2xl animate-pulse-slow">🔥</span>
                <span className="font-mono text-sm">
                  Gathering intel on this developer...
                </span>
              </div>
            )}
            {roast && (
              <p
                className={`font-mono text-sm sm:text-base leading-relaxed text-text-primary whitespace-pre-wrap ${isLoading ? "cursor-blink" : ""}`}
              >
                {roast}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-auto pt-12 text-center text-text-muted text-xs font-mono">
        <p>Powered by DeepSeek v3.2 via OpenRouter</p>
        <p className="mt-1">Don&apos;t take it personally. Or do. 🤷</p>
      </footer>
    </main>
  );
}
