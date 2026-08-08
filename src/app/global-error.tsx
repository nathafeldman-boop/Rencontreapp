"use client";

import { useEffect } from "react";

import { reportError } from "@/lib/observability/report-error";

/**
 * Replaces the ENTIRE root layout (including <html>/<body>) when the root
 * layout itself throws — the one place in the app that can't assume
 * Tailwind's stylesheet loaded correctly, so this stays inline-styled and
 * dependency-free on purpose.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    reportError(error, { digest: error.digest, scope: "root-layout" });
  }, [error]);

  return (
    <html lang="fr">
      <body
        style={{
          display: "flex",
          minHeight: "100vh",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
          padding: "2rem",
          textAlign: "center",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          background: "#ffffff",
          color: "#171717",
        }}
      >
        <h1 style={{ fontSize: "1.25rem", fontWeight: 600, margin: 0 }}>Une erreur est survenue</h1>
        <p style={{ maxWidth: "24rem", color: "#6b7280", fontSize: "0.875rem", margin: 0 }}>
          Flirtcraft a rencontré une erreur inattendue en chargeant cette page. Réessaie.
        </p>
        <button
          onClick={reset}
          style={{
            borderRadius: "9999px",
            padding: "0.625rem 1.5rem",
            background: "linear-gradient(135deg, #f0356b 0%, #7b2ff7 100%)",
            color: "#ffffff",
            fontWeight: 500,
            fontSize: "0.875rem",
            border: "none",
            cursor: "pointer",
          }}
        >
          Réessayer
        </button>
      </body>
    </html>
  );
}
