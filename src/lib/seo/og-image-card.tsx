/**
 * Shared visual for the site-wide default `opengraph-image` /
 * `twitter-image` (see `src/app/opengraph-image.tsx` and
 * `src/app/twitter-image.tsx`) — every shared link that doesn't define its
 * own OG image (blog posts, SEO landing pages) falls back to this one, so
 * link previews show a branded card instead of nothing.
 */
export function OgImageCard() {
  return (
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
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          fontSize: 72,
          fontWeight: 700,
          color: "white",
        }}
      >
        MatchAI
      </div>
      <div
        style={{
          display: "flex",
          marginTop: 24,
          maxWidth: 760,
          textAlign: "center",
          fontSize: 32,
          fontWeight: 500,
          color: "rgba(255,255,255,0.9)",
        }}
      >
        AI-powered dating profile analysis
      </div>
    </div>
  );
}
