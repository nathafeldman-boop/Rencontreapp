-- =============================================================================
-- MatchAI — Storage hardening (stage 4)
-- Photos upload directly from the browser to Supabase Storage using the
-- user's own session (see onboarding/page.tsx), bypassing our API routes
-- entirely. Client-side validation (src/components/onboarding/photo-dropzone.tsx)
-- checks type/size before upload, but that's advisory only — this is the
-- actual enforcement, at the bucket level, independent of client code.
-- =============================================================================

update storage.buckets
set
  file_size_limit = 10 * 1024 * 1024, -- 10MB, matches the client-side check
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/heic']
where id = 'profile-photos';
