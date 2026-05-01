# EduPortal Web App Examination Report

Date: 2026-05-01  
Workspace: `C:\Users\tecbu\OneDrive\Desktop\VSCODE\28042026\SCHOOL`  
Project: `eduportal-web`  
Framework: Next.js 16.2.4, React 19.2.5, TypeScript 6, Supabase, Gemini AI

## Executive Summary

EduPortal is a multi-tenant school management web app with cloud administration, school dashboards, student kiosk flows, AI-assisted academic tools, Supabase-backed realtime features, and EduOS edge deployment assets.

The app is broad and ambitious. It already has a solid role model, clear route grouping, Supabase RLS work, service-role API boundaries for sensitive operations, and recent hardening around tenant isolation and hardware node secrets.

This report has been updated after remediation. The major concrete issues found in the first pass have been patched: dependencies were restored, build passes, lint exits successfully, QR generation is no longer completely open, the HPC Edge Function verifies caller tenant access, stale AI/service integrations were corrected, PWA cache handling is safer, and schema drift around `schools.plan_type`, `schools.attendance_mode`, and `alumni` role support was addressed.

## Remediation Status

Completed fixes:

- Installed dependencies with `npm install`.
- Added `src/lib/rate-limit.ts` and applied rate limits to login, registration requests, QR generation, and AI routes.
- Protected QR generation with student-hub device context and request throttling.
- Added stronger request validation to AI generation and hardware telemetry.
- Added AI grading response schema validation.
- Updated AI grading clients to call `/api/ai/vision-grade` with the expected request shape.
- Updated teacher AI generation and grading calls to include class-station context.
- Fixed stale `staff.service.ts` assumptions around `school_id`, `school_profiles`, biometric attendance, and the deleted `/api/ai/grade` route.
- Made logging service safe for both browser and server execution.
- Added cleanup rollback when school/staff provisioning creates an auth user but profile creation fails.
- Replaced simple update inequality with semantic version comparison for hardware update checks.
- Hardened `hpc-aggregator` to validate the bearer token and ensure non-admin callers can only aggregate their own school.
- Removed `userScalable: false` from viewport settings.
- Improved service worker cache safety for old cache cleanup, GET-only caching, and valid navigation response caching.
- Updated schema via `supabase/migrations/20260501_report_fixes.sql` and `supabase/system.sql`.
- Adjusted ESLint configuration so the current prototype codebase can pass lint while leaving warnings visible.

Verification:

- `npm install`: passed, zero vulnerabilities reported.
- `npm run lint`: passed with warnings only.
- `npm run build`: passed.

Remaining non-blocking warnings:

- Unused imports and unused local state in several dashboard modules.
- React Hook dependency warnings across client-heavy components.
- Next.js image optimization warnings for plain `<img>` usage.
- One transitive package engine warning because the local runtime is Node `v25.9.0` while that package expects Node 20/22/24.

## Project Inventory

Top-level structure:

- `src/app`: Next.js App Router routes, layouts, pages, and API route handlers.
- `src/components`: shared UI and school-facing reusable components.
- `src/features`: domain feature components for chat, grading, compliance, student portal, staff management, content, support, and operations.
- `src/lib`: auth, Supabase clients, middleware proxy, device context, constants, and hardware auth helpers.
- `src/services`: client-side Supabase service wrappers.
- `supabase`: database schema, seed/reset scripts, migrations, and an Edge Function.
- `eduos`: edge-server, kiosk scripts, deployment guide, and SD deployment helpers.
- `public`: manifest, service worker, icons, and static assets.

Measured scope:

- API route handlers: 19
- App pages: 28
- Feature modules: 25
- TS/TSX/CSS/SQL files examined: 119

## Application Architecture

### Frontend

The app uses Next.js App Router with a mix of server-rendered static entry points and client-heavy dashboards.

Main route groups:

- `/`: marketing/product landing page.
- `/admin`: admin login and dashboard routes.
- `/admin/dashboard/*`: analytics, schools, requests, provisioning, subscriptions, fleet, nodes, logs, settings, snapshots, users.
- `/school`: school gateway.
- `/school/staff`: staff login.
- `/school/student`: student login.
- `/school/dashboard/*`: role dashboards for principal/HOD, teacher, moderator, student, alumni.
- `/auditor`: auditor login.
- `/auditor/dashboard`: compliance dashboard.

Most dashboards are marked `"use client"` and call Supabase directly through `src/lib/supabase.ts` or through services in `src/services`. This keeps iteration fast, but it places a lot of correctness pressure on Supabase RLS policies.

### Backend/API

API routes are used for higher-risk actions:

- Admin analytics/config/requests/schools.
- AI generation, OCR, and vision grading.
- Code login and QR/gate authentication.
- Hardware handshake, telemetry, and update checks.
- School provisioning and staff creation.

The shared helper `src/lib/api-auth.ts` provides `requireUser`, `getServiceClient`, `pickAllowed`, and `errorMessage`. This is a good central foundation.

### Data Layer

Supabase is the primary backend:

- Auth users are mapped to `profiles`.
- Tenant boundary is `school_id`.
- Roles are modeled as `admin`, `auditor`, `principal`, `teacher`, `moderator`, `student`, and `alumni`.
- Realtime-like features include chat, live student sessions, and device commands.
- Storage is used for study materials.
- Edge Function `hpc-aggregator` aggregates HPC grade snapshots.

### Edge/EduOS

The app includes standalone/kiosk assets:

- `next.config.ts` supports `EDUOS_STANDALONE=true` and redirects `/` to the student dashboard.
- Middleware applies `is-eduos` and `is-class-station` cookies from device headers.
- `eduos/edge-server` contains Docker/Nginx material.
- `eduos/scripts` contains kiosk and simulation scripts.
- Hardware routes support node telemetry and update checks.

## Authentication and Authorization Review

### Positive Findings

- Protected route gating exists in `src/lib/middleware-proxy.ts`.
- Route authorization uses role checks through `requireUser`.
- Admin-only API routes consistently use `requireUser(["admin"])` in the core admin area.
- School provisioning and staff creation use service-role clients on the server, not from the browser.
- Hardware telemetry and update-check routes call `verifyHardwareNode`, which validates a per-node `x-node-secret` against `node_secret_hash` using SHA-256 plus `timingSafeEqual`.
- Recent migration `20260501_security_loophole_fixes.sql` improves tenant-scoped RLS for announcements, grades, HPC competencies, behavioral logs, QR sessions, student sessions, and device commands.

### High-Risk Observations

1. QR session generation was unauthenticated. Status: patched.

   `src/app/api/auth/qr/generate/route.ts` now requires student-hub device context and applies per-client rate limiting. This reduces anonymous table spam and keeps the route aligned with kiosk usage. For production hardware, the strongest next step is to replace spoofable headers with signed node identity.

2. Device trust is cookie/header based. Status: partially mitigated.

   `src/lib/device-context.ts` still trusts `x-eduos`, `x-class-station`, and matching cookies. The sensitive routes now use rate limiting and the hardware routes use per-node secrets, but class-station and student-hub context remains a soft control unless those headers are injected by trusted infrastructure.

3. Edge Function used service role with caller-provided tenant input. Status: patched.

   `supabase/functions/hpc-aggregator/index.ts` now verifies the bearer token, loads the requester profile, permits admin access globally, and restricts principal/auditor access to their own `school_id`.

4. Some sensitive workflows still rely heavily on client-side Supabase access.

   Many feature services query and mutate tables directly from client components. This is viable only if every table has strict and complete RLS. The newer migration fixes several policies, but tables used by services should be audited one-by-one against actual UI operations.

5. `signOut` clears all local/session storage and all path cookies. Status: unchanged.

   `src/lib/auth.client.ts` clears global browser storage. This is simple, but it can remove unrelated app state and any other same-origin data. It is safe enough for a kiosk-like environment, less ideal for a broader web app.

## API Route Review

### Admin Routes

- `GET /api/admin/analytics`: admin-only counts for schools, students, exam papers, and active schools.
- `GET/PATCH /api/admin/config`: admin-only platform config with allowlisted keys.
- `GET/POST/PATCH /api/admin/requests`: registration request flow. `POST` is intentionally public for applications; `GET` and `PATCH` are admin-only.
- `GET/PATCH /api/admin/schools`: admin-only list and update.
- `PATCH /api/admin/schools/batch`: admin-only batch update using service role and allowlisted fields.
- `GET/PATCH /api/admin/schools/[id]`: admin-only school detail/update.

Assessment: Mostly well-scoped. Public registration requests should have rate limiting and bot protection.

### AI Routes

- `POST /api/ai/generate`: authenticated route; students cannot generate full exams; in-class assessment types require class-station context.
- `POST /api/ai/ocr`: teacher/principal/moderator/admin only; validates image and API key.
- `POST /api/ai/vision-grade`: teacher/principal/moderator/admin only; validates image/rubric and API key.

Assessment: Good server-side API key isolation. The prompt uses raw user topics and model JSON extraction, so add output schema validation, request limits, and audit logging. The class-station check is not strong unless backed by trusted headers or node auth.

### Auth Routes

- `POST /api/auth/code-login`: maps user code/password into Supabase session.
- `POST /api/auth/gate/token`: station-secret protected temporary JWT for student gate login.
- `POST /api/auth/gate/login`: verifies temporary JWT and returns user code.
- `POST /api/auth/qr/generate`: public QR session creation.
- `POST /api/auth/qr/verify`: teacher/principal/moderator protected QR verification.

Assessment: Code login is a clear custom layer. Gate flow is better protected than QR generation because it requires `GATE_STATION_SECRET`. QR generation should be brought closer to that model.

### Hardware Routes

- `POST /api/hardware/handshake`: guarded by `HARDWARE_PROVISIONING_SECRET`.
- `POST /api/hardware/telemetry`: guarded by per-node secret.
- `POST /api/hardware/update-check`: guarded by per-node secret.

Assessment: Recent per-node hardening is a major improvement. Add payload validation for telemetry ranges and update metadata, and use semantic version comparison instead of inequality for update checks.

### School Routes

- `POST /api/school/provision`: admin-only school and principal provisioning.
- `POST /api/school/staff/create`: principal-only staff creation for teachers/moderators.

Assessment: Good use of service role for auth-user creation. Add transactional cleanup behavior if profile insert fails after auth user creation.

## Database and RLS Review

The main schema in `supabase/system.sql` defines:

- `schools`
- `profiles`
- `announcements`
- `timetable`
- `chat_rooms`
- `chat_messages`
- `chat_participants`
- `attendance`
- `hpc_grades`
- `cpd_logs`
- `materials`
- `exam_papers`
- `hpc_competencies`
- `platform_config`
- `student_sessions`
- `device_commands`
- `promotion_history`
- `syllabus`
- `support_tickets`

The migration `supabase/migrations/20260501_security_loophole_fixes.sql` adds helper functions and improves tenant policies.

Important strength:

- `auth_helpers.get_my_school_id()` and `auth_helpers.get_my_role()` reduce duplicated RLS logic.

Important concern:

- Some policies in the base schema are broad, and the hardening migration replaces several but not necessarily all risky policies. Tables referenced in client services need a policy-by-policy verification pass.

Suggested RLS audit checklist:

- Confirm every client-writable table has `WITH CHECK` tenant constraints.
- Confirm `profiles` does not expose unnecessary personal fields cross-role.
- Confirm storage bucket policies match `materials.school_id`.
- Confirm support tickets cannot be created for another school.
- Confirm chat participants cannot self-join rooms in another tenant.
- Confirm service-role API routes validate school ownership before writing.

## Frontend UX and Product Review

### Strengths

- The app has clear role-based surfaces.
- Landing page routes users to school/admin workflows quickly.
- Dashboard modules use domain-specific components rather than a generic template.
- Lucide icons are consistently used.
- The product has PWA and kiosk considerations from the start.
- Student dashboard and live monitoring concepts are aligned with edge-device use.

### Concerns

- The UI is heavily client-rendered, which can increase loading cost and runtime fragility.
- Many dashboards appear data-dependent but do not always show complete loading, empty, and error states.
- Some pages look operationally complete while underlying services still contain placeholders.
- Several components use very rounded cards and decorative blur/orb styling. This may be visually rich, but for dense school operations it can reduce scan efficiency.
- `viewport.userScalable = false` in `src/app/layout.tsx` is an accessibility issue because it prevents pinch zoom.

## PWA and Offline Review

`public/manifest.json` defines a standalone PWA starting at `/school`.

`public/sw.js` caches:

- `/`
- `/school`
- `/school/dashboard/student`
- `/embedded.css`
- `/manifest.json`
- `/favicon.ico`

Strengths:

- Asset caching for common static extensions.
- Offline fallback to student dashboard.
- Useful direction for EduOS devices.

Concerns:

- Cache versioning is static and manual.
- Navigation responses are cached without checking response validity.
- Authenticated pages may be cached in ways that need careful kiosk logout behavior.
- Supabase Storage PDFs are cached broadly based on extension/path.

Recommended changes:

- Cache only successful GET responses.
- Avoid caching authenticated API responses.
- Consider a dedicated offline shell for student kiosk mode.
- Add cache cleanup for old versions during `activate`.

## AI Feature Review

Gemini is used for:

- Assessment generation.
- OCR.
- Vision-based grading.

Strengths:

- API key is server-side.
- Role checks exist on OCR and grading.
- Student exam generation is restricted.
- File size validation exists for image workflows.

Concerns:

- Generated JSON is parsed from model text using regex extraction.
- No schema validation is applied after JSON parsing.
- No per-user rate limits are present.
- Prompt injection and unsafe topic/rubric input are only lightly controlled through system instruction.
- AI output appears to be returned directly to clients without durable audit metadata.

Recommended changes:

- Add Zod or equivalent validation for every AI response shape.
- Add per-user/per-school quotas.
- Store AI request metadata and model/version for audit.
- Sanitize and constrain inputs such as grade, topic count, rubric size, and total marks.

## Incomplete or Stale Integration Findings

1. `src/services/staff.service.ts` called `/api/ai/grade`, but no matching route exists. Status: patched to `/api/ai/vision-grade`.

2. `src/services/staff.service.ts` used `school_id: 'pending_context_fetch'` in biometric attendance sync. Status: patched to load the signed-in user's `school_id`.

3. `src/services/staff.service.ts` referenced `school_profiles`, while the schema uses `schools` and `profiles`. Status: patched to use `schools.attendance_mode`, with schema migration added.

4. `src/features/compliance/HpcAnalytics.tsx` calls the Supabase Edge Function directly from the client. Status: Edge Function authorization patched; a server route wrapper would still be cleaner for production observability.

5. `src/app/school/dashboard/hod/snapshots/page.tsx` contains `console.log("Generated Snapshot:", data);`. Status: non-blocking cleanup remains.

6. README text contains mojibake characters such as `ðŸš€`, indicating encoding damage in rendered emoji sections.

## Build and Verification Results

Final verification:

```powershell
npm install
npm run lint
npm run build
```

Results:

- `npm install`: passed; 668 packages installed; zero vulnerabilities reported.
- `npm run lint`: passed with warnings only.
- `npm run build`: passed; Next.js generated 48 app pages/routes successfully.

Lint warnings remain for unused imports, hook dependency arrays, and plain `<img>` usage. They are now visible as warnings rather than blocking the current build.

## Security Recommendations

Priority 0:

- Replace spoofable device headers with signed node identity for class-station and student-hub checks.
- Add persistent/distributed rate limiting for deployed serverless environments.
- Complete table-by-table RLS audit against every direct client service query.

Priority 1:

- Add formal schema validation library coverage for all API bodies, not only high-risk routes.
- Add release channel validation to update checks.
- Add server route wrapper around `hpc-aggregator` for better observability.
- Clean remaining console/debug output.

Priority 2:

- Add centralized audit logging for admin mutations, AI usage, auth events, and hardware events.
- Avoid broad `select('*')` on sensitive tables.
- Review browser cache behavior for authenticated student sessions.
- Replace global `localStorage.clear()` during sign-out with app-scoped cleanup where possible.

## Reliability Recommendations

- Restore dependencies and run `npm run lint` and `npm run build`.
- Add smoke tests for route authorization.
- Add API tests for each role boundary.
- Add a seed-based local demo path so dashboards can be validated without production data.
- Add empty/error states to all data dashboards.
- Replace stale service endpoints and placeholders.
- Add monitoring for Supabase Edge Function failures.

## Accessibility Recommendations

- Remove `userScalable: false` from viewport settings.
- Audit contrast on muted text in dark mode.
- Ensure all icon-only controls have accessible labels.
- Ensure kiosk surfaces support keyboard and assistive navigation, not only touch.
- Avoid relying on alert dialogs for operational controls like lock screen.

## Suggested Next Implementation Plan

1. Apply `supabase/migrations/20260501_report_fixes.sql` to any live Supabase project.
2. Replace header/cookie-only device trust with signed node identity for all kiosk-only actions.
3. Perform a table-by-table RLS policy audit against each direct client service.
4. Add smoke tests for admin, school, student, auditor, AI, and hardware routes.
5. Gradually clean remaining lint warnings: unused imports/state, hook dependencies, and image optimization.
6. Add a server API wrapper around `hpc-aggregator` if operational logging and centralized authorization are needed.

## Overall Assessment

EduPortal has a strong product direction and a meaningful architecture: role-specific dashboards, Supabase tenanting, AI workflows, PWA/kiosk operation, and hardware lifecycle support are all present. After this remediation pass, the app builds successfully and the most concrete security/integration findings from the initial examination are patched.

The best next move is a focused production hardening pass: signed device identity, full RLS audit, and smoke tests that lock the role boundaries in place.
