import { useState } from "react";

type Band = {
  id: number;
  name: string;
  country?: string;
  country_code?: string;
  genre?: string;
  description?: string;
  decade?: string;
  spotify_url?: string;
  popularity?: number;
  score?: number;
};

const API_URL = import.meta.env.VITE_API_URL as string | undefined;

const getFlagUrl = (countryCode?: string) => {
  if (!countryCode) return null;
  return `https://flagcdn.com/24x18/${countryCode.toLowerCase()}.png`;
};

function App() {
  const [query, setQuery] = useState("Ghost");
  const [results, setResults] = useState<Band[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!API_URL) {
      setError("VITE_API_URL is not configured.");
      return;
    }

    const trimmed = query.trim();
    if (!trimmed) {
      setError("Please type a band name.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/recommendations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: trimmed, limit: 10 })
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }

      const json = await res.json();
      setResults(json.results ?? []);
    } catch (err: any) {
      setError(err.message || "Unknown error");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      style={{
        maxWidth: "720px",
        margin: "2rem auto",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif"
      }}
    >
      <h1>Band Recommender</h1>
      <p>Type a band name (e.g. Ghost) and get similar bands.</p>

      <form onSubmit={handleSubmit} style={{ marginBottom: "1.5rem" }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder=""
          style={{
            padding: "0.6rem 0.8rem",
            width: "70%",
            maxWidth: "380px",
            marginRight: "0.5rem"
          }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "0.6rem 0.9rem",
            cursor: loading ? "default" : "pointer"
          }}
        >
          {loading ? "Searching..." : "Get recommendations"}
        </button>
      </form>

      {error && (
        <div style={{ color: "red", marginBottom: "1rem" }}>
          Error: {error}
        </div>
      )}

      {!loading && !error && results.length === 0 && (
        <p style={{ color: "#666" }}>
          Try searching for <strong>Ghost</strong> to see recommendations.
        </p>
      )}

      {results.length > 0 && (
        <ul style={{ listStyle: "none", padding: 0, marginTop: "1rem" }}>

          {results.map((band) => {
            const flagUrl = getFlagUrl(band.country_code);

            return (
              <li
                key={band.id}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  padding: "0.8rem 1rem",
                  marginBottom: "0.75rem"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  
                  <div>
                    <strong>{band.name}</strong>{" "}
                    {flagUrl && (
                    <img
                      src={flagUrl}
                      alt={band.country ? `${band.country} flag` : "Country flag"}
                      width={24}
                      height={18}
                      style={{ borderRadius: "2px", flexShrink: 0 }}
                    />
                  )}
                  </div>
                </div>

                {band.genre && (
                  <div style={{ fontSize: "0.9rem", color: "#555" }}>{band.genre}</div>
                )}
                {band.description && (
                  <p style={{ marginTop: "0.4rem" }}>{band.description}</p>
                )}
                <div style={{ fontSize: "0.8rem", color: "#777" }}>
                  {typeof band.score === "number" &&
                    `similarity: ${band.score.toFixed(3)} `}
                  {typeof band.popularity === "number" &&
                    `(popularity: ${band.popularity})`}
                </div>
                {band.spotify_url && (
                  <a
                    href={band.spotify_url}
                    target="_blank"
                    rel="noreferrer"
                    style={{ fontSize: "0.8rem" }}
                  >
                    Open on Spotify
                  </a>
                )}
              </li>
            );
          })}


        </ul>
      )}
    </main>
  );
}

export default App;
