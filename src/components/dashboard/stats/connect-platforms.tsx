import { Check } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DatingApp } from "@/types/database.types";

const PLATFORMS: { value: DatingApp; label: string }[] = [
  { value: "tinder", label: "Tinder" },
  { value: "hinge", label: "Hinge" },
  { value: "bumble", label: "Bumble" },
];

/**
 * Tinder, Hinge and Bumble have no public API — Flirtcraft doesn't connect
 * to them automatically, officially or otherwise, and never will. This
 * used to promise a connector "bientôt disponible" that would never ship;
 * it now just shows what the user told us at onboarding
 * (`users.dating_apps_used`), which is honest and still useful context.
 */
export function ConnectPlatforms({ datingAppsUsed }: { datingAppsUsed: DatingApp[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Tes applications</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 pt-0">
        <p className="text-xs text-muted-foreground">
          Aucune de ces applis n&apos;ouvre son accès aux autres services — impossible de s&apos;y connecter
          automatiquement, ni maintenant ni plus tard. C&apos;est pour ça que tu déclares tes chiffres toi-même,
          chaque semaine, dans Progression — 30 secondes, avec un préremplissage par capture d&apos;écran.
        </p>
        <div className="flex flex-col gap-2">
          {PLATFORMS.map((platform) => {
            const used = datingAppsUsed.includes(platform.value);
            return (
              <div
                key={platform.value}
                className="flex items-center justify-between rounded-lg border border-border px-4 py-3"
              >
                <span className="text-sm font-medium">{platform.label}</span>
                {used ? (
                  <Badge className="gap-1">
                    <Check className="size-3" />
                    Déclarée à l&apos;inscription
                  </Badge>
                ) : (
                  <Badge variant="secondary">Non déclarée</Badge>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
