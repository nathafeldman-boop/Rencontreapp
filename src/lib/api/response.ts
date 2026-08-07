import { NextResponse } from "next/server";
import type { ZodError } from "zod";

export function apiError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function apiValidationError(error: ZodError) {
  return NextResponse.json(
    { error: "Validation failed", issues: error.issues },
    { status: 422 }
  );
}

export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json({ data }, { status });
}
