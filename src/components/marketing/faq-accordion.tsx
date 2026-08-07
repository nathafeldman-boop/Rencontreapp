"use client";

import { ChevronDown } from "lucide-react";

const FAQ_ITEMS = [
  {
    q: "Can I cancel anytime?",
    a: "Yes — one click from Settings > Manage billing, no phone call, no retention flow. You keep access until the end of your current billing period.",
  },
  {
    q: "Is my payment secure?",
    a: "Payments are processed by Stripe. MatchAI never sees or stores your card number.",
  },
  {
    q: "What happens to my data if I cancel?",
    a: "Your past analyses and history stay in your account — you just lose access to the premium tools until you resubscribe.",
  },
  {
    q: "Will this actually work for me?",
    a: "Every recommendation is generated from your own photos, bio, and stated goal — not a generic checklist.",
  },
];

export function FaqAccordion() {
  return (
    <div className="mx-auto w-full max-w-md px-6 py-4">
      <h2 className="mb-3 text-sm font-medium text-muted-foreground">Frequently asked</h2>
      <div className="flex flex-col divide-y divide-border rounded-xl border border-border">
        {FAQ_ITEMS.map((item) => (
          <details key={item.q} className="group p-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-medium marker:content-none">
              {item.q}
              <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180" />
            </summary>
            <p className="mt-2 text-sm text-muted-foreground">{item.a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
