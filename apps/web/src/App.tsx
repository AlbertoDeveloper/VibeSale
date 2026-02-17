import { useEffect, useState } from "react";
import type { ApiMessageResponse } from "@vibesale/shared";
import "./App.css";

function App() {
  const [data, setData] = useState<ApiMessageResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMessage() {
      try {
        const response = await fetch("/api/message");

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const payload = (await response.json()) as ApiMessageResponse;
        setData(payload);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    loadMessage();
  }, []);

  return (
    <main className="app">
      <h1>VibeSale App Starter</h1>
      <p>React + TypeScript frontend with TypeScript backend.</p>

      <section className="panel">
        <h2>API status</h2>
        {loading && <p>Loading message from backend...</p>}
        {!loading && error && <p className="error">Error: {error}</p>}
        {!loading && data && (
          <>
            <p>{data.message}</p>
            <small>{new Date(data.timestamp).toLocaleString()}</small>
          </>
        )}
      </section>
    </main>
  );
}

export default App;
