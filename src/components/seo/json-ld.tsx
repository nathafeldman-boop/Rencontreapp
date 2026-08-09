/**
 * Renders a `<script type="application/ld+json">` block. `data` must be a
 * plain, JSON-serializable object built server-side — never pass raw user
 * input through this without sanitizing, since it's injected as HTML.
 *
 * `<` is escaped to `<` as defense-in-depth: `JSON.stringify` does
 * NOT escape `</script>` sequences on its own, so a string value
 * containing one would otherwise prematurely close the tag and let
 * whatever follows execute as markup/script. Every current caller only
 * passes static, founder-authored content, but this makes the component
 * itself safe regardless of what future callers pass in.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
