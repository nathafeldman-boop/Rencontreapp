import { reportError } from "@/lib/observability/report-error";

/**
 * Runs once when the server starts, before any request is handled. This
 * is where an APM/error-monitoring SDK gets initialized — see README
 * "Observability" for the exact `Sentry.init(...)` call to add once
 * `SENTRY_DSN` is configured. Left as a no-op otherwise, so the app has
 * no dependency on a package that isn't installed.
 */
export async function register() {
  // Intentionally empty until a monitoring provider is wired in.
}

/**
 * Next.js calls this for any error thrown in a Server Component, Route
 * Handler, or Server Action that isn't already caught by an `error.tsx`
 * boundary — the server-side counterpart to `src/app/error.tsx`.
 */
export async function onRequestError(
  error: unknown,
  request: { path: string; method: string },
  context: { routerKind: string; routeType: string }
) {
  reportError(error, { path: request.path, method: request.method, routeType: context.routeType });
}
