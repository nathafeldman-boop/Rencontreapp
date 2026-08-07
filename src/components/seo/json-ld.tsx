/**
 * Renders a `<script type="application/ld+json">` block. `data` must be a
 * plain, JSON-serializable object built server-side — never pass raw user
 * input through this without sanitizing, since it's injected as HTML.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}
