"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ChipButton } from "@/components/onboarding/chip-button";
import { ConfidenceSlider } from "@/components/onboarding/confidence-slider";
import { PhotoDropzone, MIN_PHOTOS } from "@/components/onboarding/photo-dropzone";
import { createClient } from "@/lib/supabase/client";
import { track } from "@/lib/analytics/track";
import { AnalyticsEvent } from "@/lib/analytics/events";
import {
  OBJECTIVE_OPTIONS,
  WEEKLY_MATCHES_OPTIONS,
  BIGGEST_PROBLEM_OPTIONS,
} from "@/lib/validations/onboarding";
import type { DatingApp, Gender } from "@/types/database.types";

const DATING_APPS: { value: DatingApp; label: string }[] = [
  { value: "tinder", label: "Tinder" },
  { value: "hinge", label: "Hinge" },
  { value: "bumble", label: "Bumble" },
  { value: "other", label: "Autre" },
];

const STEP_COUNT = 7;

interface FormState {
  age: string;
  gender: Gender | "";
  location: string;
  dating_app: DatingApp | "";
  objective: string;
  weekly_matches: string;
  biggest_problem: string;
  confidence: number;
  bio: string;
  photos: File[];
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [submittingAnswers, setSubmittingAnswers] = useState(false);
  const [submittingProfile, setSubmittingProfile] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({
    age: "",
    gender: "",
    location: "",
    dating_app: "",
    objective: "",
    weekly_matches: "",
    biggest_problem: "",
    confidence: 5,
    bio: "",
    photos: [],
  });

  useEffect(() => {
    track(AnalyticsEvent.OnboardingStarted, {});
  }, []);

  const uploadStepTracked = useRef(false);
  useEffect(() => {
    if (step === 7 && !uploadStepTracked.current) {
      uploadStepTracked.current = true;
      track(AnalyticsEvent.ProfileUploadStarted, {});
    }
  }, [step]);

  function canAdvance() {
    if (step === 1) {
      const age = Number(form.age);
      return Number.isInteger(age) && age >= 18 && age <= 100 && form.gender !== "" && form.location.trim() !== "";
    }
    if (step === 2) return form.dating_app !== "";
    if (step === 3) return form.objective !== "";
    if (step === 4) return form.weekly_matches !== "";
    if (step === 5) return form.biggest_problem !== "";
    if (step === 6) return true; // slider always has a value
    if (step === 7) return form.bio.trim().length > 0 && form.photos.length >= MIN_PHOTOS;
    return false;
  }

  async function handleNext() {
    setError(null);

    // Steps 1-6 collect the answers; persist them right before the upload
    // step so a drop-off after this point still leaves usable data.
    if (step === 6) {
      setSubmittingAnswers(true);
      try {
        const res = await fetch("/api/onboarding", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            age: Number(form.age),
            gender: form.gender,
            location: form.location,
            dating_app: form.dating_app,
            objective: form.objective,
            weekly_matches: form.weekly_matches,
            biggest_problem: form.biggest_problem,
            confidence: form.confidence,
          }),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => null);
          const issueDetail = Array.isArray(body?.issues)
            ? body.issues
                .map((issue: { path?: (string | number)[]; message?: string }) =>
                  `${issue.path?.join(".") || "champ"} : ${issue.message}`
                )
                .join(" · ")
            : null;
          throw new Error(
            issueDetail
              ? `Impossible d'enregistrer tes réponses : ${issueDetail}`
              : body?.error
                ? `Impossible d'enregistrer tes réponses : ${body.error}`
                : "Impossible d'enregistrer tes réponses — réessaie."
          );
        }
        track(AnalyticsEvent.OnboardingCompleted, { steps_completed: 6 });
      } catch (e) {
        setError(e instanceof Error ? e.message : "Une erreur est survenue.");
        setSubmittingAnswers(false);
        return;
      }
      setSubmittingAnswers(false);
    }

    setStep((s) => s + 1);
  }

  async function handleLaunchAnalysis() {
    setSubmittingProfile(true);
    setError(null);

    try {
      const supabase = createClient();
      const {
        data: { user },
        error: getUserError,
      } = await supabase.auth.getUser();

      if (!user) {
        console.error("getUser() returned no user", getUserError);
        throw new Error(
          getUserError?.message
            ? `Ta session a expiré — reconnecte-toi. (${getUserError.message})`
            : "Ta session a expiré — reconnecte-toi."
        );
      }

      const photoPaths: string[] = [];
      for (const photo of form.photos) {
        const path = `${user.id}/${crypto.randomUUID()}-${photo.name}`;
        const { error: uploadError } = await supabase.storage
          .from("profile-photos")
          .upload(path, photo, { upsert: false });
        if (uploadError) throw new Error(`Échec de l'envoi de la photo : ${uploadError.message}`);
        photoPaths.push(path);
      }
      track(AnalyticsEvent.ProfileUploadCompleted, { photo_count: photoPaths.length });

      const profileRes = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bio: form.bio,
          dating_app: form.dating_app,
          photo_paths: photoPaths,
        }),
      });

      if (!profileRes.ok) {
        const body = await profileRes.json().catch(() => null);
        throw new Error(
          body?.error
            ? `Impossible d'enregistrer ton profil : ${body.error}`
            : "Impossible d'enregistrer ton profil — réessaie."
        );
      }

      router.push("/analyze");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Une erreur est survenue.");
      setSubmittingProfile(false);
    }
  }

  const isBusy = submittingAnswers || submittingProfile;

  return (
    <main className="flex flex-1 flex-col items-center px-6 py-12">
      <div className="w-full max-w-md">
        <Progress value={(step / STEP_COUNT) * 100} />
        <p className="mt-2 text-xs text-muted-foreground">
          Étape {step} / {STEP_COUNT}
        </p>

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
                <h1 className="text-xl font-semibold">Personnalisons ton analyse</h1>
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
                  <Label>Genre</Label>
                  <div className="mt-1.5 grid grid-cols-2 gap-2">
                    {(["male", "female", "non_binary", "other"] as Gender[]).map((g) => (
                      <ChipButton key={g} active={form.gender === g} onClick={() => setForm((f) => ({ ...f, gender: g }))}>
                        {{ male: "Homme", female: "Femme", non_binary: "Non-binaire", other: "Autre" }[g]}
                      </ChipButton>
                    ))}
                  </div>
                </div>
                <div>
                  <Label htmlFor="location">Localisation</Label>
                  <Input
                    id="location"
                    className="mt-1.5"
                    placeholder="Ville, pays"
                    value={form.location}
                    onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="flex flex-col gap-4">
                <h1 className="text-xl font-semibold">Quelle application de rencontre utilises-tu le plus ?</h1>
                <div className="grid grid-cols-2 gap-2">
                  {DATING_APPS.map((app) => (
                    <ChipButton
                      key={app.value}
                      active={form.dating_app === app.value}
                      onClick={() => setForm((f) => ({ ...f, dating_app: app.value }))}
                    >
                      {app.label}
                    </ChipButton>
                  ))}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="flex flex-col gap-4">
                <h1 className="text-xl font-semibold">Quel est ton objectif principal ?</h1>
                <div className="grid grid-cols-1 gap-2">
                  {OBJECTIVE_OPTIONS.map((option) => (
                    <ChipButton
                      key={option.value}
                      active={form.objective === option.value}
                      onClick={() => setForm((f) => ({ ...f, objective: option.value }))}
                    >
                      {option.label}
                    </ChipButton>
                  ))}
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="flex flex-col gap-4">
                <h1 className="text-xl font-semibold">Combien de matchs obtiens-tu par semaine ?</h1>
                <div className="grid grid-cols-4 gap-2">
                  {WEEKLY_MATCHES_OPTIONS.map((option) => (
                    <ChipButton
                      key={option.value}
                      active={form.weekly_matches === option.value}
                      onClick={() => setForm((f) => ({ ...f, weekly_matches: option.value }))}
                    >
                      {option.label}
                    </ChipButton>
                  ))}
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="flex flex-col gap-4">
                <h1 className="text-xl font-semibold">Quel est ton plus gros problème en ce moment ?</h1>
                <div className="grid grid-cols-1 gap-2">
                  {BIGGEST_PROBLEM_OPTIONS.map((option) => (
                    <ChipButton
                      key={option.value}
                      active={form.biggest_problem === option.value}
                      onClick={() => setForm((f) => ({ ...f, biggest_problem: option.value }))}
                    >
                      {option.label}
                    </ChipButton>
                  ))}
                </div>
              </div>
            )}

            {step === 6 && (
              <div className="flex flex-col gap-6">
                <h1 className="text-xl font-semibold">Quel est ton niveau de confiance sur ton profil ?</h1>
                <ConfidenceSlider
                  value={form.confidence}
                  onChange={(confidence) => setForm((f) => ({ ...f, confidence }))}
                />
              </div>
            )}

            {step === 7 && (
              <div className="flex flex-col gap-4">
                <h1 className="text-xl font-semibold">Envoie ton profil</h1>
                <p className="-mt-2 text-sm text-muted-foreground">
                  C&apos;est ce qu&apos;on va analyser — plus ça ressemble à ton vrai profil, meilleurs
                  seront les résultats.
                </p>
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
                  <Label>Photos</Label>
                  <div className="mt-1.5">
                    <PhotoDropzone
                      photos={form.photos}
                      onChange={(photos) => setForm((f) => ({ ...f, photos }))}
                    />
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

        <div className="mt-8 flex justify-between">
          <Button variant="ghost" disabled={step === 1 || isBusy} onClick={() => setStep((s) => s - 1)}>
            Retour
          </Button>
          {step < STEP_COUNT ? (
            <Button disabled={!canAdvance() || isBusy} onClick={handleNext}>
              {submittingAnswers ? <Loader2 className="animate-spin" /> : null}
              Continuer
              <ArrowRight />
            </Button>
          ) : (
            <Button disabled={!canAdvance() || isBusy} onClick={handleLaunchAnalysis}>
              {submittingProfile ? <Loader2 className="animate-spin" /> : null}
              Lancer mon analyse
            </Button>
          )}
        </div>
      </div>
    </main>
  );
}
