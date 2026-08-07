"use client";

import { useCallback, useState } from "react";

/**
 * Shared "POST to a Stripe route, redirect to the returned Checkout/Portal
 * URL" flow — used by the paywall, the premium comparison page, and the
 * billing settings card, which otherwise each hand-rolled the same
 * fetch/loading/error boilerplate.
 */
export function useStripeRedirect() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const redirect = useCallback(
    async (endpoint: string, options?: { body?: unknown; errorMessage?: string }) => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: options?.body ? { "Content-Type": "application/json" } : undefined,
          body: options?.body ? JSON.stringify(options.body) : undefined,
        });

        if (res.ok) {
          const { data } = await res.json();
          window.location.assign(data.url);
          return;
        }

        setError(options?.errorMessage ?? "Something went wrong — try again.");
      } catch {
        setError(options?.errorMessage ?? "Something went wrong — check your connection and try again.");
      } finally {
        // On success we're navigating away via window.location.assign, so this
        // extra setLoading(false) is harmless — it just never gets seen.
        setLoading(false);
      }
    },
    []
  );

  return { loading, error, redirect };
}
