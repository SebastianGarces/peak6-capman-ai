"use client";

// global-error.tsx must render its own <html> and <body> — it replaces the root layout.
// No theme provider or Tailwind context available; use inline styles only.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          display: "flex",
          minHeight: "100vh",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
          background: "hsl(222, 47%, 6%)",
          color: "hsl(210, 40%, 96%)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            borderRadius: "0.75rem",
            border: "1px solid rgba(255,255,255,0.06)",
            background: "hsl(222, 30%, 10% / 0.8)",
            backdropFilter: "blur(12px)",
            padding: "2.5rem",
            textAlign: "center",
            maxWidth: "28rem",
            width: "100%",
          }}
        >
          {/* CapMan AI branding */}
          <p
            style={{
              fontSize: "1.125rem",
              fontWeight: 700,
              background: "linear-gradient(to right, hsl(142,71%,45%), hsl(160,60%,50%))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              marginBottom: "1.5rem",
            }}
          >
            CapMan AI
          </p>

          <h2
            style={{
              fontSize: "1.25rem",
              fontWeight: 600,
              color: "hsl(210, 40%, 96%)",
              marginBottom: "0.5rem",
            }}
          >
            Critical Error
          </h2>
          <p style={{ fontSize: "0.875rem", color: "hsl(215, 20%, 65%)", marginBottom: "0.25rem" }}>
            A critical error occurred. Your session data is safe.
          </p>
          {error.digest && (
            <p
              style={{
                fontSize: "0.7rem",
                fontFamily: "monospace",
                color: "hsl(215, 20%, 50%)",
                marginBottom: "1rem",
              }}
            >
              Error: {error.digest}
            </p>
          )}

          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", marginTop: "1.5rem" }}>
            <button
              onClick={reset}
              style={{
                borderRadius: "0.5rem",
                background: "linear-gradient(to right, hsl(142,71%,45%), hsl(160,60%,45%))",
                padding: "0.5rem 1.25rem",
                fontSize: "0.875rem",
                fontWeight: 500,
                color: "#fff",
                border: "none",
                cursor: "pointer",
              }}
            >
              Try Again
            </button>
            <button
              onClick={() => { window.location.href = "/"; }}
              style={{
                borderRadius: "0.5rem",
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.12)",
                padding: "0.5rem 1.25rem",
                fontSize: "0.875rem",
                fontWeight: 500,
                color: "hsl(210, 40%, 96%)",
                cursor: "pointer",
              }}
            >
              Go Home
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
