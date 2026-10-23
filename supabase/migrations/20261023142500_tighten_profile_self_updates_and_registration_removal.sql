-- Self-service accounts may edit their display name only; trusted Edge Functions
-- remain responsible for registration, section, program, and academic metadata.
REVOKE INSERT, UPDATE, DELETE ON TABLE public.profiles FROM PUBLIC, anon, authenticated;
GRANT UPDATE (name) ON TABLE public.profiles TO authenticated;

-- The account-removal Edge Function records removed registrations. Allow that
-- lifecycle state explicitly instead of silently rejecting it at the database.
ALTER TABLE public.student_registrations
  DROP CONSTRAINT IF EXISTS student_registrations_status_check;

ALTER TABLE public.student_registrations
  ADD CONSTRAINT student_registrations_status_check
  CHECK (status = ANY (ARRAY[
    'pending'::text,
    'approved'::text,
    'rejected'::text,
    'needs_edit'::text,
    'linked'::text,
    'removed'::text
  ]));
