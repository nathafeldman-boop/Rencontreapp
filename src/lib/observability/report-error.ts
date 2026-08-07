/**
 * Single choke point for reporting unexpected client/server errors (error
 * boundaries, caught exceptions worth surfacing). Currently logs
 * structured output to the console; swap the body for
 * `Sentry.captureException(error, { extra: context })` once a Sentry DSN
 * is configured (see README "Observability") — nothing else in the app
 * needs to change, since every call already goes through here.
 */
export function reportError(error: unknown, context?: Record<string, unknown>) {
  console.error("[MatchAI] Unhandled error", error, context ?? {});
}
