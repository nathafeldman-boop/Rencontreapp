"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Loader2, Upload, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { createClient } from "@/lib/supabase/client";
import { track } from "@/lib/analytics/track";
import { AnalyticsEvent } from "@/lib/analytics/events";
import type { DatingApp, DatingGoal, Gender } from "@/types/database.types";

const DATING_APPS: { value: DatingApp; label: string }[] = [
  { value: "tinder", label: "Tinder" },
  { value: "bumble", label: "Bumble" },
  { value: "hinge", label: "Hinge" },
  { value: "other", label: "Autre" },
];

const DATING_GOALS: { value: DatingGoal; label: string }[] = [
  { value: "serious_relationship", label: "Relation sérieuse" },
  { value: "casual_dating", label: "Dating casual" },
  { value: "friends", label: "Rencontrer du monde" },
  { value: "not_sure", label: "Je ne sais pas encore" },
];

const STEP_COUNT = 4;

interface FormState {
  age: string;
  gender: Gender | "";
  country: string;
  dating_apps_used: DatingApp[];
  dating_goal: DatingGoal | "";
  match_count: string;
  main_difficulty: string;
  bio: string;
  primary_app: DatingApp;
  photos: File[];
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({
    age: "",
    gender: "",
    country: "",
    dating_apps_used: [],
    dating_goal: "",
    match_count: "",
    main_difficulty: "",
    bio: "",
    primary_app: "tinder",
    photos: [],
  });

  function toggleApp(app: DatingApp) {
    setForm((f) => ({
      ...f,
      dating_apps_used: f.dating_apps_used.includes(app)
        ? f.dating_apps_used.filter((a) => a !== app)
        : [...f.dating_apps_used, app],
    }));
  }

  function canAdvance() {
    if (step === 1) return form.age !== "" && form.gender !== "" && form.country.trim() !== "";
    if (step === 2) return form.dating_apps_used.length > 0 && form.dating_goal !== "";
    if (step === 3) return form.match_count.trim() !== "" && form.main_difficulty.trim() !== "";
    if (step === 4) return form.bio.trim().length > 0 && form.photos.length > 0;
    return false;
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("Session expirée, reconnecte-toi.");

      const onboardingRes = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          age: Number(form.age),
          gender: form.gender,
          country: form.country,
          dating_apps_used: form.dating_apps_used,
          dating_goal: form.dating_goal,
          answers: [
            { question: "Combien de matchs obtiens-tu par semaine ?", answer: form.match_count },
            { question: "Quelle est ta principale difficulté ?", answer: form.main_difficulty },
          ],
        }),
      });

      if (!onboardingRes.ok) throw new Error("Impossible d'enregistrer tes réponses.");
      track(AnalyticsEvent.OnboardingCompleted, { steps_completed: STEP_COUNT });

      const photoPaths: string[] = [];
      for (const photo of form.photos) {
        const path = `${user.id}/${crypto.randomUUID()}-${photo.name}`;
        const { error: uploadError } = await supabase.storage
          .from("profile-photos")
          .upload(path, photo, { upsert: false });
        if (uploadError) throw new Error(`Échec de l'upload : ${uploadError.message}`);
        photoPaths.push(path);
      }
      track(AnalyticsEvent.PhotosUploaded, { photo_count: photoPaths.length });

      const profileRes = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bio: form.bio,
          dating_app: form.primary_app,
          photo_paths: photoPaths,
        }),
      });

      if (!profileRes.ok) throw new Error("Impossible d'enregistrer ton profil.");

      router.push("/analyze");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Une erreur est survenue.");
      setSubmitting(false);
    }
  }

  return (
    <main className="flex flex-1 flex-col items-center px-6 py-12">
      <div className="w-full max-w-md">
        <Progress value={(step / STEP_COUNT) * 100} />
        <p className="mt-2 text-xs text-muted-foreground">Étape {step} / {STEP_COUNT}</p>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.25 }}
            className="mt-8"
          >
            {step === 1 && (
              <div className="flex flex-col gap-4">
                <h1 className="text-xl font-semibold">Parle-nous de toi</h1>
                <div>
                  <Label htmlFor="age">Âge</Label>
                  <Input
                    id="age"
                    type="number"
                    min={18}
                    max={100}
                    className="mt-1.5"
                    value={form.age}
                    onChange={(e) => setForm((f) => ({ ...f, age: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Sexe</Label>
                  <div className="mt-1.5 grid grid-cols-2 gap-2">
                    {(["male", "female", "non_binary", "other"] as Gender[]).map((g) => (
                      <ChipButton
                        key={g}
                        active={form.gender === g}
                        onClick={() => setForm((f) => ({ ...f, gender: g }))}
                      >
                        {{ male: "Homme", female: "Femme", non_binary: "Non-binaire", other: "Autre" }[g]}
                      </ChipButton>
                    ))}
                  </div>
                </div>
                <div>
                  <Label htmlFor="country">Pays</Label>
                  <Input
                    id="country"
                    className="mt-1.5"
                    placeholder="France"
                    value={form.country}
                    onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="flex flex-col gap-4">
                <h1 className="text-xl font-semibold">Tes apps & ton objectif</h1>
                <div>
                  <Label>Applications utilisées</Label>
                  <div className="mt-1.5 grid grid-cols-2 gap-2">
                    {DATING_APPS.map((app) => (
                      <ChipButton
                        key={app.value}
                        active={form.dating_apps_used.includes(app.value)}
                        onClick={() => toggleApp(app.value)}
                      >
                        {app.label}
                      </ChipButton>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Objectif</Label>
                  <div className="mt-1.5 grid grid-cols-1 gap-2">
                    {DATING_GOALS.map((goal) => (
                      <ChipButton
                        key={goal.value}
                        active={form.dating_goal === goal.value}
                        onClick={() => setForm((f) => ({ ...f, dating_goal: goal.value }))}
                      >
                        {goal.label}
                      </ChipButton>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="flex flex-col gap-4">
                <h1 className="text-xl font-semibold">Où en es-tu aujourd&apos;hui ?</h1>
                <div>
                  <Label htmlFor="match_count">Matchs obtenus par semaine, environ</Label>
                  <Input
                    id="match_count"
                    className="mt-1.5"
                    placeholder="Ex : 2-3"
                    value={form.match_count}
                    onChange={(e) => setForm((f) => ({ ...f, match_count: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="main_difficulty">Ta principale difficulté</Label>
                  <Input
                    id="main_difficulty"
                    className="mt-1.5"
                    placeholder="Ex : peu de matchs, conversations qui meurent..."
                    value={form.main_difficulty}
                    onChange={(e) => setForm((f) => ({ ...f, main_difficulty: e.target.value }))}
                  />
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="flex flex-col gap-4">
                <h1 className="text-xl font-semibold">Ton profil actuel</h1>
                <div>
                  <Label>App principale à analyser</Label>
                  <div className="mt-1.5 grid grid-cols-2 gap-2">
                    {DATING_APPS.map((app) => (
                      <ChipButton
                        key={app.value}
                        active={form.primary_app === app.value}
                        onClick={() => setForm((f) => ({ ...f, primary_app: app.value }))}
                      >
                        {app.label}
                      </ChipButton>
                    ))}
                  </div>
                </div>
                <div>
                  <Label htmlFor="bio">Ta bio actuelle</Label>
                  <textarea
                    id="bio"
                    rows={4}
                    className="mt-1.5 w-full rounded-lg border border-input bg-transparent px-4 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={form.bio}
                    onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Photos (2 à 6)</Label>
                  <label className="mt-1.5 flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-dashed border-border p-6 text-sm text-muted-foreground hover:bg-secondary/50">
                    <Upload className="size-5" />
                    Ajouter des photos
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          photos: [...f.photos, ...Array.from(e.target.files ?? [])].slice(0, 6),
                        }))
                      }
                    />
                  </label>
                  {form.photos.length > 0 && (
                    <ul className="mt-3 flex flex-wrap gap-2">
                      {form.photos.map((photo, i) => (
                        <li
                          key={`${photo.name}-${i}`}
                          className="flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs"
                        >
                          {photo.name}
                          <button
                            type="button"
                            onClick={() =>
                              setForm((f) => ({ ...f, photos: f.photos.filter((_, idx) => idx !== i) }))
                            }
                          >
                            <X className="size-3" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

        <div className="mt-8 flex justify-between">
          <Button variant="ghost" disabled={step === 1 || submitting} onClick={() => setStep((s) => s - 1)}>
            Retour
          </Button>
          {step < STEP_COUNT ? (
            <Button disabled={!canAdvance()} onClick={() => setStep((s) => s + 1)}>
              Continuer
              <ArrowRight />
            </Button>
          ) : (
            <Button disabled={!canAdvance() || submitting} onClick={handleSubmit}>
              {submitting ? <Loader2 className="animate-spin" /> : null}
              Lancer l&apos;analyse
            </Button>
          )}
        </div>
      </div>
    </main>
  );
}

function ChipButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg border px-4 py-2.5 text-left text-sm transition-colors ${
        active
          ? "border-primary bg-accent text-accent-foreground"
          : "border-border hover:bg-secondary"
      }`}
    >
      {children}
    </button>
  );
}
