import type { ConnectablePlatform, DatingPlatformConnector } from "@/lib/dating-platforms/types";

/**
 * Registry of platform connectors. Every entry is `null` for the MVP — see
 * the top-level prompt this was built from: no direct Tinder/Hinge/Bumble/
 * Meetic integration, no credential capture, no scraping. This file exists
 * so a future official-API integration is a matter of implementing
 * `DatingPlatformConnector` and registering it here, with no changes needed
 * anywhere else that reads `CONNECTORS` (e.g. the Statistiques page's
 * "Connecter mes applications" section).
 */
export const CONNECTORS: Record<ConnectablePlatform, DatingPlatformConnector | null> = {
  tinder: null, // TinderConnector — not implemented
  hinge: null, // HingeConnector — not implemented
  bumble: null, // BumbleConnector — not implemented
  meetic: null, // MeeticConnector — not implemented
};

export function getConnector(platform: ConnectablePlatform): DatingPlatformConnector {
  const connector = CONNECTORS[platform];
  if (!connector) {
    throw new Error(`No connector implemented yet for "${platform}".`);
  }
  return connector;
}
