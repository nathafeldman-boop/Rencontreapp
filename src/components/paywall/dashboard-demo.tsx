"use client";

import { motion } from "framer-motion";

import { PhoneMockupCarousel } from "@/components/marketing/phone-mockup-carousel";

const AI_MODES = [
  { emoji: "🥊", title: "Entraînement", detail: "Discute avec un match simulé" },
  { emoji: "💬", title: "Conversation", detail: "Obtiens 3 réponses adaptées" },
];

const SUGGESTIONS = [
  { tone: "Naturelle", message: "Plutôt un brunch tranquille, et toi ?" },
  { tone: "Flirt", message: "Ça dépend, tu es libre pour me le montrer ?" },
];

const PLATFORMS = ["Tinder", "Meetic"];

/**
 * Honest preview of the actual premium dashboard — everything shown here
 * exists in the real product (AI hub, coach suggestions, the platforms
 * list). "Bientôt disponible" stays on the platform rows since no
 * integration is actually live — see src/lib/dating-platforms/.
 */
export function DashboardDemo() {
  return (
    <PhoneMockupCarousel
      title="Voici FlirtCraft une fois abonné"
      subtitle="Le dashboard, ton coach et tes conversations — en vrai, pas une maquette."
      scenes={[<AiHubScene key="ai" />, <CoachScene key="coach" />, <ConnectScene key="connect" />]}
    />
  );
}

function AiHubScene() {
  return (
    <div className="flex h-full flex-col justify-center gap-3">
      <p className="text-xs font-semibold text-muted-foreground">Comment veux-tu utiliser FlirtCraft ?</p>
      {AI_MODES.map((mode, i) => (
        <motion.div
          key={mode.title}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 + i * 0.2, duration: 0.3 }}
          className="flex items-center gap-2.5 rounded-lg border border-border bg-background px-3 py-2.5"
        >
          <span className="text-lg">{mode.emoji}</span>
          <div>
            <p className="text-xs font-medium">{mode.title}</p>
            <p className="text-[9px] text-muted-foreground">{mode.detail}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function CoachScene() {
  return (
    <div className="flex h-full flex-col gap-3">
      <p className="text-xs font-semibold text-muted-foreground">Coach de conversation</p>
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.3 }}
        className="self-start rounded-2xl bg-secondary px-3 py-2 text-[10px]"
      >
        Tu fais quoi ce week-end ?
      </motion.div>

      <div className="mt-1 flex flex-col gap-2">
        {SUGGESTIONS.map((s, i) => (
          <motion.div
            key={s.tone}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + i * 0.25, duration: 0.3 }}
            className="rounded-lg border border-border bg-background px-2.5 py-2"
          >
            <span className="text-[9px] font-semibold text-primary">{s.tone}</span>
            <p className="mt-0.5 text-[10px]">{s.message}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function ConnectScene() {
  return (
    <div className="flex h-full flex-col justify-center gap-2.5">
      <p className="text-xs font-semibold text-muted-foreground">Connecter mes applications</p>
      {PLATFORMS.map((platform, i) => (
        <motion.div
          key={platform}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 + i * 0.2, duration: 0.3 }}
          className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2.5"
        >
          <span className="text-[11px] font-medium">{platform}</span>
          <span className="rounded-full bg-secondary px-2 py-0.5 text-[8px] text-secondary-foreground">
            Bientôt disponible
          </span>
        </motion.div>
      ))}
    </div>
  );
}
