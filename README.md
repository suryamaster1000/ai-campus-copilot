# AI Campus Copilot

AI Campus Copilot is a student campus dashboard connected to **Supabase** for authentication, profiles, academic records, registrations, administration, and grounded AI.

## Live routes

- Dashboard: `#dashboard`
- AI Assistant: `#ai-assistant`
- Timetable: `#timetable`
- Notices: `#notices`
- Study Assistant: `#study-assistant`
- Campus Guide: `#campus-guide`
- Events: `#events`
- My Tasks: `#my-tasks`
- Settings: `#settings`
- Admin Panel: `#admin-panel`

## Authentication and access

- Supabase Auth protects the application.
- The owner account has owner access.
- Authorized students listed in `admin_users` can access the Admin Panel.
- Linked student registrations can access the student dashboard.
- Unapproved accounts are rejected.
- Newly created student accounts can be required to change their temporary password on first login.
- Administrative actions are additionally protected by Supabase RLS and Edge Functions.

## Student Registration

Registration is backed by `student_registrations` and validated against the official `admission_directory`.

The current admission directory contains the supplied CSM7 admission records. The application does not invent student records when data is missing.

## Live campus data

The frontend loads connected data from Supabase, including:

- Student profile
- Personal tasks
- Attendance
- Subjects
- Faculty
- Timetable
- Exams
- Academic assignments
- Notices
- Events
- Campus locations
- Academic rules

Empty tables produce empty states instead of demo campus records.

## AI Campus Copilot

The `ai-campus-copilot` Supabase Edge Function:

- authenticates the requesting user
- limits administrative context to authorized administrators
- includes the authenticated student's relevant context
- can retrieve live academic records
- optionally uses semantic knowledge-base retrieval
- uses Gemini for generation
- never exposes Supabase service-role secrets to browser code

Semantic retrieval is treated as an enhancement rather than a hard dependency, so the assistant can still answer from available live database records when the vector retrieval service is unavailable.

## Backend

**Supabase is the only application backend/service connector.**

The browser contains only the Supabase publishable key. Service-role credentials and Gemini secrets remain in Supabase Edge Function secrets.

## Local development

From the project directory:

```bash
python -m http.server 3000
```

Then open:

```
http://localhost:3000
```

Because the project uses ES modules and Supabase Auth, use an HTTP server rather than opening `index.html` directly with `file://`.

## Deployment

The current frontend is deployable as a static GitHub Pages site. Supabase handles authentication, database access, RLS, and Edge Functions.

