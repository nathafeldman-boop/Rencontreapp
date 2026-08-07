"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

/**
 * Fetches the live count from /api/stats and animates up to it. Starts
 * from a sensible fallback so the landing page never flashes "0".
 */
export function AnimatedCounter({ fallback = 12_847 }: { fallback?: number }) {
  const [target, setTarget] = useState(fallback);
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, { damping: 30, stiffness: 90 });
  const display = useTransform(spring, (v) => Math.round(v).toLocaleString("en-US"));

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
