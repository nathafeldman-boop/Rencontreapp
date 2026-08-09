"use client";

import { useEffect } from "react";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

import { track } from "@/lib/analytics/track";
import { AnalyticsEvent } from "@/lib/analytics/events";

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
  useEffect(() => {
    track(AnalyticsEvent.DeeplinkView, { source });
  }, [source]);

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

      <a
        href={destUrl}
        onClick={() => track(AnalyticsEvent.DeeplinkCtaClicked, { source, dest: destUrl })}
        className="group mt-6 flex w-full max-w-sm items-center justify-center gap-2 rounded-full bg-brand-gradient px-6 py-4 text-base font-semibold shadow-lg shadow-black/30 transition-transform active:scale-[0.98]"
      >
        {ctaLabel}
        <ArrowRight className="size-5 animate-bounce transition-transform group-active:translate-x-0.5" />
      </a>
    </div>
  );
}
