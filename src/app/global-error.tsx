"use client";

// Note: global-error.tsx must define its own <html> and <body> tags
// because it replaces the root layout when active.
// Uses inline styles only — no theme provider or context available.
export default function GlobalError() {
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
          background: "#0a0a0a",
          color: "#ededed",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            borderRadius: "0.5rem",
            border: "1px solid rgba(239,68,68,0.3)",
            background: "rgba(239,68,68,0.05)",
            padding: "2rem",
            textAlign: "center",
            maxWidth: "28rem",
          }}
        >
          <h2 style={{ fontSize: "1.25rem", fontWeight: 600, color: "#ef4444" }}>
            Something went wrong
          </h2>
          <p style={{ marginTop: "0.5rem", fontSize: "0.875rem", color: "#a1a1aa" }}>
            A critical error occurred. Please try refreshing the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: "1rem",
              borderRadius: "0.375rem",
              background: "#6366f1",
              padding: "0.5rem 1rem",
              fontSize: "0.875rem",
              fontWeight: 500,
              color: "#fff",
              border: "none",
              cursor: "pointer",
            }}
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
