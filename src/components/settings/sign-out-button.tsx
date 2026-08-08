"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSignOut() {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  }

  return (
    <Button variant="outline" onClick={handleSignOut} disabled={loading} className="w-fit">
      {loading ? <Loader2 className="animate-spin" /> : <LogOut />}
      Se déconnecter
    </Button>
  );
}
