import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PLATFORMS = ["Tinder", "Hinge", "Bumble", "Meetic"];

/**
 * Honest placeholder — no platform is actually connected or syncing.
 * See src/lib/dating-platforms/ for the (unimplemented) architecture this
 * will eventually wire into.
 */
export function ConnectPlatforms() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Connecter mes applications</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 pt-0">
        {PLATFORMS.map((platform) => (
          <div
            key={platform}
            className="flex items-center justify-between rounded-lg border border-border px-4 py-3"
          >
            <span className="text-sm font-medium">{platform}</span>
            <Badge variant="secondary">Bientôt disponible</Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
