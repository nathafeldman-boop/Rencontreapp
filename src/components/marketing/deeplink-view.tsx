"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ArrowRight, TriangleAlert } from "lucide-react";

import { track } from "@/lib/analytics/track";
import { AnalyticsEvent } from "@/lib/analytics/events";
import { androidEscapeUrl, detectInAppBrowser, detectMobilePlatform, type InAppBrowserApp } from "@/lib/utils/in-app-browser";

const APP_LABEL: Record<Exclude<InAppBrowserApp, null>, string> = {
  tiktok: "TikTok",
  instagram: "Instagram",
  facebook: "Facebook",
};

export function DeeplinkView({
  img,
  title,
  ctaLabel,
  source,
  destUrl,
}: {
  img: string;
  title: string;
  ctaLabel: string;
  source: string;
  destUrl: string;
}) {
  // Default to "nothing detected" so the first client render matches the
  // static server HTML (no hydration mismatch) — the real value only
  // matters once we're past that first paint anyway.
  const [inAppApp, setInAppApp] = useState<InAppBrowserApp>(null);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    const userAgent = navigator.userAgent;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time read of a browser-only value, no server equivalent to sync against
    setInAppApp(detectInAppBrowser(userAgent));
    setIsAndroid(detectMobilePlatform(userAgent) === "android");
    track(AnalyticsEvent.DeeplinkView, { source });
  }, [source]);

  // On Android, an intent:// link makes the OS open the user's real
  // browser directly — Google sign-in then works normally. No equivalent
  // trick exists for iOS, so iOS gets on-screen instructions instead (see
  // banner below) rather than a link that would just silently do nothing.
  const href = inAppApp && isAndroid ? androidEscapeUrl(destUrl) : destUrl;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center bg-black px-6 py-8 text-white">
      <div className="flex w-full max-w-sm flex-1 flex-col items-center">
        <Image src="/brand/mark.png" alt="Flirtcraft" width={32} height={32} className="shrink-0" priority />

        <div className="relative mt-6 flex w-full flex-1 items-center justify-center overflow-hidden rounded-2xl bg-white/5">
          {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary aspect ratio post image, next/image's fixed sizing fights the layout here */}
          <img src={img} alt="" className="max-h-full max-w-full object-contain" />
        </div>

        <h1 className="mt-6 text-balance text-center text-xl font-semibold leading-snug">{title}</h1>
      </div>

      {inAppApp && !isAndroid && (
        <div className="mt-6 flex w-full max-w-sm items-start gap-2 rounded-xl bg-white/10 px-4 py-3 text-sm text-white/90">
          <TriangleAlert className="mt-0.5 size-4 shrink-0 text-amber-400" />
          <p>
            Tu es dans le navigateur intégré de {APP_LABEL[inAppApp]} — tape sur <span className="font-semibold">⋯</span> en
            haut à droite, puis <span className="font-semibold">« Ouvrir dans Safari »</span> pour continuer sans problème.
          </p>
        </div>
      )}

      <a
        href={href}
        onClick={() => track(AnalyticsEvent.DeeplinkCtaClicked, { source, dest: destUrl })}
        className="group mt-6 flex w-full max-w-sm items-center justify-center gap-2 rounded-full bg-brand-gradient px-6 py-4 text-base font-semibold shadow-lg shadow-black/30 transition-transform active:scale-[0.98]"
      >
        {ctaLabel}
        <ArrowRight className="size-5 animate-bounce transition-transform group-active:translate-x-0.5" />
      </a>
    </div>
  );
}
