"use client";

import { useState } from "react";
import { Check, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";

export function HobbiesEditor({ initialHobbies }: { initialHobbies: string }) {
  const [hobbies, setHobbies] = useState(initialHobbies);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save() {
    if (!hobbies.trim()) return;
    setLoading(true);
    setSaved(false);
    try {
      const res = await fetch("/api/settings/hobbies", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hobbies: hobbies.trim() }),
      });
      if (res.ok) setSaved(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <textarea
        rows={3}
        placeholder="Ex : escalade le week-end, je bosse dans le marketing, fan de cuisine thaï..."
        className="w-full rounded-lg border border-input bg-transparent px-4 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        value={hobbies}
        onChange={(e) => {
          setHobbies(e.target.value);
          setSaved(false);
        }}
      />
      <Button size="sm" onClick={save} disabled={loading || !hobbies.trim()} className="w-fit">
        {loading ? <Loader2 className="size-3.5 animate-spin" /> : saved ? <Check className="size-3.5" /> : null}
        {saved ? "Enregistré" : "Enregistrer"}
      </Button>
    </div>
  );
}
