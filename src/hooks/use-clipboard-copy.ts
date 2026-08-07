"use client";

import { useCallback, useState } from "react";

/**
 * Shared "copy to clipboard, flash a confirmation" behavior — used by the
 * bio generator and the weekly report's opener list. `key` lets a list
 * track which specific item was just copied.
 */
export function useClipboardCopy(resetDelayMs = 1500) {
  const [copiedKey, setCopiedKey] = useState<string | number | null>(null);

  const copy = useCallback(
    async (text: string, key: string | number) => {
      try {
        await navigator.clipboard.writeText(text);
        setCopiedKey(key);
        setTimeout(() => setCopiedKey((current) => (current === key ? null : current)), resetDelayMs);
      } catch {
        // Clipboard permission denied or unavailable — nothing to recover from, just skip the confirmation flash.
      }
    },
    [resetDelayMs]
  );

  return { copiedKey, copy };
}
