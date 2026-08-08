import type { DatingPlatform } from "@/types/database.types";

/**
 * Normalized shape a real platform sync would produce, matching the columns
 * on `public.dating_stats` (see supabase/migrations/0007_dating_stats.sql).
 * Manual entry (the MVP path — see /api/dating-stats) already produces this
 * exact shape, so swapping it for a real sync later is a drop-in.
 */
export interface PlatformStats {
  periodStart: string;
  periodEnd: string;
  likes: number;
  matches: number;
  conversations: number;
  replies: number;
  dates: number;
}

export type ConnectablePlatform = Exclude<DatingPlatform, "other">;

/**
 * Contract a real integration (official API, once available — never
 * scraping or credential capture) would implement. Not implemented for the
 * MVP: every entry in `CONNECTORS` is `null`. This interface exists purely
 * so the rest of the app (dating_connections, the Statistiques page's
 * "bientôt disponible" section) can be written against a stable shape.
 */
export interface DatingPlatformConnector {
  platform: ConnectablePlatform;
  /** Kicks off the platform's own OAuth/consent flow. Returns a redirect URL. */
  connect(userId: string): Promise<{ redirectUrl: string }>;
  /** Revokes access and marks the connection as disconnected. */
  disconnect(userId: string): Promise<void>;
  /** Pulls stats for the given window and normalizes them to PlatformStats. */
  syncStats(userId: string, periodStart: string, periodEnd: string): Promise<PlatformStats>;
}
