import Link from "next/link";
import { Compass } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-secondary text-muted-foreground">
        <Compass className="size-6" />
      </div>
      <h1 className="text-xl font-semibold">Page introuvable</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        La page que tu cherches n&apos;existe pas ou a été déplacée.
      </p>
      <Button asChild>
        <Link href="/">Retour à l&apos;accueil</Link>
      </Button>
    </main>
  );
}
