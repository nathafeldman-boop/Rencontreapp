import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

function clampScore(value: string | null): number {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}

/**
 * Renders the shareable "Dating Score" card as a PNG — for TikTok/
 * Instagram/Twitter (see components/dashboard/share-score-card.tsx).
 * Takes the score as a query param rather than looking up an analysis by
 * id: the client already knows its own score, and this keeps the endpoint
 * public without exposing any private DB row through a guessable URL.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const overall = clampScore(searchParams.get("score"));
  const photo = searchParams.get("photo") ? clampScore(searchParams.get("photo")) : null;
  const bio = searchParams.get("bio") ? clampScore(searchParams.get("bio")) : null;
  const conversation = searchParams.get("conversation") ? clampScore(searchParams.get("conversation")) : null;

  const stats = [
    photo !== null && { label: "Photos", value: photo },
    bio !== null && { label: "Bio", value: bio },
    conversation !== null && { label: "Conversation", value: conversation },
  ].filter(Boolean) as { label: string; value: number }[];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #f0356b 0%, #7b2ff7 100%)",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            color: "rgba(255,255,255,0.9)",
            fontSize: 30,
            fontWeight: 600,
            marginBottom: 20,
          }}
        >
          Mon Dating Score
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 300,
            height: 300,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.15)",
            border: "6px solid rgba(255,255,255,0.5)",
            color: "white",
            fontSize: 120,
            fontWeight: 700,
          }}
        >
          {overall}
        </div>

        {stats.length > 0 && (
          <div style={{ display: "flex", gap: 20, marginTop: 28 }}>
            {stats.map((stat) => (
              <div
                key={stat.label}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  color: "white",
                  background: "rgba(255,255,255,0.12)",
                  borderRadius: 16,
                  padding: "12px 24px",
                }}
              >
                <div style={{ display: "flex", fontSize: 34, fontWeight: 700 }}>{stat.value}</div>
                <div style={{ display: "flex", fontSize: 18, opacity: 0.85 }}>{stat.label}</div>
              </div>
            ))}
          </div>
        )}

        <div
          style={{
            display: "flex",
            position: "absolute",
            bottom: 28,
            fontSize: 22,
            fontWeight: 700,
            color: "rgba(255,255,255,0.85)",
            letterSpacing: 1,
          }}
        >
          MatchAI
        </div>
      </div>
    ),
    { ...size }
  );
}
