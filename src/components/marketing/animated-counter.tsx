"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

/**
 * Fetches the live count from /api/stats (which already includes the
 * founder-set baseline — see BASELINE_ANALYZED_PROFILES in
 * app/api/stats/route.ts) and animates up to it. Fallback of 800 matches
 * that baseline so a slow/failed fetch doesn't flash "0" before the real
 * number loads.
 */
export function AnimatedCounter({ fallback = 800 }: { fallback?: number }) {
  const [target, setTarget] = useState(fallback);
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, { damping: 30, stiffness: 90 });
  const display = useTransform(spring, (v) => Math.round(v).toLocaleString("fr-FR"));

  useEffect(() => {
    let cancelled = false;
    fetch("/api/stats")
      .then((res) => res.json())
      .then(({ data }) => {
        if (!cancelled && typeof data?.analyzedProfiles === "number") {
          setTarget(data.analyzedProfiles);
        }
      })
      .catch(() => {
        /* keep fallback */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    motionValue.set(target);
  }, [target, motionValue]);

  return <motion.span>{display}</motion.span>;
}
