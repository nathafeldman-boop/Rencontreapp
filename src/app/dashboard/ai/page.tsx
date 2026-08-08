import Link from "next/link";
import { ArrowRight, MessageCircle, Swords } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

const MODES = [
  {
    href: "/dashboard/simulator",
    icon: Swords,
    emoji: "🥊",
    title: "Entraînement",
    description: "Entraîne-toi à discuter comme avec un vrai match.",
  },
  {
    href: "/dashboard/coach",
    icon: MessageCircle,
    emoji: "💬",
    title: "Conversation",
    description: "Envoie une conversation et obtiens une analyse personnalisée.",
  },
];

export default function AiHubPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Coach</h1>
        <p className="mt-1 text-sm text-muted-foreground">Comment veux-tu utiliser FlirtCraft ?</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {MODES.map((mode) => (
          <Link key={mode.href} href={mode.href}>
            <Card className="h-full transition-colors hover:border-primary/40">
              <CardContent className="flex h-full flex-col gap-3 p-6">
                <span className="text-3xl">{mode.emoji}</span>
                <div>
                  <p className="font-medium">{mode.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{mode.description}</p>
                </div>
                <span className="mt-auto flex items-center gap-1 text-sm font-medium text-primary">
                  Commencer
                  <ArrowRight className="size-4" />
                </span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
