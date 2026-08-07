import { ImageResponse } from "next/og";

import { OgImageCard } from "@/lib/seo/og-image-card";

export const alt = "MatchAI — AI-powered dating profile analysis";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function TwitterImage() {
  return new ImageResponse(<OgImageCard />, { ...size });
}
