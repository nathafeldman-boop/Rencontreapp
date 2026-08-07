import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { BioGeneratorView } from "@/components/dashboard/bio/bio-generator-view";

export default async function BioGeneratorPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("bio")
    .eq("user_id", user?.id ?? "")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (
    <div className="flex flex-col gap-6">
      <Link href="/dashboard" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" />
        Dashboard
      </Link>

      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Bio Generator</h1>
        <p className="mt-1 text-sm text-muted-foreground">Pick a style, get 5 bios built from your real profile.</p>
      </div>

      <BioGeneratorView currentBio={profile?.bio ?? ""} />
    </div>
  );
}
