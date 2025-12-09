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
  sample_url?: string;
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
        width: "640px",
        margin: "0 auto",
        padding: "3rem 1rem",
        textAlign: "center",
      }}
    >
      <h1
        style={{
          fontSize: "2.5rem",
          fontWeight: 700,
          marginBottom: "2rem",
          color: "white",
        }}
      >
        Artist Affinity Engine
      </h1>
      <p>Type a band name (e.g. Ghost) and get similar artists.</p>

      <form onSubmit={handleSubmit} style={{ marginBottom: "2rem" }}>
        <input
          name="artist-input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder=""
          style={{
            padding: "15px 0 15px 15px",
            width: "97%",
            borderRadius: "6px",
            border: "1px solid #aaa",
            background: "#2a2a2a",
            color: "white",
            marginBottom: "1rem",
            fontSize: "1rem",
            fontFamily: 'inherit',
            fontWeight: 'bold'
          }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "0.8rem 1.2rem",
            background: "#ff7f11",
            color: "black",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: 700,
            fontSize: "1rem",
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
        <ul
          style={{
            listStyle: "none",
            padding: 0,
            marginTop: "2rem",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "1.2rem",
          }}
        >

          {results.map((band, index) => {
            const flagUrl = getFlagUrl(band.country_code);

            return (
              <li
                key={band.id}
                className="fade-in"
                style={{
                  animationDelay: `${index * 0.05}s`,
                  background: "#222",
                  border: "1px solid #333",
                  borderRadius: "8px",
                  padding: "1rem",
                  color: "white",
                }}
              >
                <div style={{ alignItems: "center", gap: "0.5rem" }}>

                  <div>
                    <strong style={{
                      marginRight: "10px"
                    }}>{band.name}</strong>{" "}
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
                  <p style={{ marginTop: "0.4rem", minHeight: "72px" }}>{band.description}</p>
                )}
                <div style={{ fontSize: "0.8rem", color: "#777", marginBottom: "15px" }}>
                  {typeof band.score === "number" &&
                    `similarity: ${band.score.toFixed(3)} `}
                  {typeof band.popularity === "number" &&
                    `(popularity: ${band.popularity})`}
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    marginTop: "0.5rem",
                    flexWrap: "wrap"
                  }}
                >
                  {band.spotify_url && (
                    <a
                      href={band.spotify_url}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        fontSize: "0.8rem",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.4rem",
                        textDecoration: "none",
                        color: "#1DB954"
                      }}
                    >
                      <img
                        src="https://cdn.simpleicons.org/spotify/1DB954"
                        alt="Spotify"
                        width={18}
                        height={18}
                        style={{ display: "block" }}
                      />
                      <span>Open on Spotify</span>
                    </a>
                  )}

                  {band.sample_url && (
                    <audio
                      src={band.sample_url}
                      controls
                      style={{ height: "28px" }}
                    />
                  )}
                </div>


              </li>
            );
          })}


        </ul>
      )}
    </main>
  );
}

export default App;
