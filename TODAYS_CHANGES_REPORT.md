# EduPortal Changes Completed Today

## 1. Offline-First Sync Is Working

EduPortal now has an append-only event sync foundation.

Instead of depending only on direct updates, the system can record student, exam, attendance, grade, and device actions as ordered events. This makes offline sync safer because data is not overwritten during conflicts.

The system now supports logical ordering using version counters, so it does not depend only on device time.

## 2. Live Test Auto-Save Is Working

The live test flow now protects students during power cuts, Wi-Fi drops, and accidental reloads.

Every answer is saved locally as soon as the student selects it. If the device restarts or the network drops, the student can continue from the saved state.

Final submit now retries in the background with random delay, so many students submitting together will not overload the local station.

Question order and option order are also randomized per student to reduce copying.

## 3. APAAR / ABC Student Identity Support Is Working

EduPortal now supports the correct NEP-style student model.

Students are no longer treated only as school-bound records. The system now supports a global student identity linked to APAAR / ABC ID, with separate school enrollments.

This allows student transfers, promotions, alumni history, and lifelong HPC tracking across schools.

## 4. Offline Health Dashboard Is Working

A local health dashboard is now available for Class Station and school operations users.

It can show offline status, storage pressure, pending exam sync data, and clear teacher-friendly instructions.

It also generates a QR code support bridge so a teacher can scan diagnostics with a phone when the Class Station has no internet.

## 5. Grade Version Protection Is Working

Grade updates now use a version counter.

This protects against wrong results caused by broken device clocks. If a Class Station clock resets to an old date, the newer grade edit still wins because the version number is higher.

This supports the rule that grades originate from the teacher/Class Station side.

## 6. Cryptographic Hardware Trust Is Working

Hardware requests now support signed verification.

Class Stations can be registered with a public key, and sensitive hardware requests must be signed by the matching private key.

This prevents students from spoofing headers such as fake device IDs.

Replay protection was also added so copied old requests cannot be reused.

## 7. Face Embedding Verification Is Working

The face verification flow now supports sending small face embeddings instead of video streams.

Student Hubs do not need to stream live video over Wi-Fi. They can send compact mathematical face data, and the Class Station/server flow can compare it against stored templates.

This reduces bandwidth and supports faster classroom verification.

## 8. Hub Distribution Mode Is Working

A high-speed classroom Hub distribution workflow is now available.

Teachers can pair a recognized student with a physical Student Hub using a scanner-style QR workflow.

The system records which student has which Hub.

At the end of class, the teacher can end the session and lock all checked-out Hubs remotely. Student Hubs sign out and return to the locked state.

## 9. Enterprise Architecture Hardening Updated

The Detailed Working Report was updated for B2G pilot readiness.

The document now clearly marks the remaining pilot blockers instead of presenting them as normal future improvements.

Key architecture corrections added today:

- API responses must never return plaintext passwords, reset tokens, or recovery links.
- Supabase Auth and database profile creation are not treated as one atomic transaction.
- Failed provisioning must use idempotent jobs, tenant activation gates, and compensating cleanup for orphaned Auth users.
- Classroom Realtime channels must be tenant-scoped, session-scoped, and authorized instead of using guessable class room names.
- Live test submissions must be durably projected into `test_submissions` and `test_answers`.
- Student Hub timers are treated only as UI convenience; backend or Class Station time must enforce the real deadline.
- QR verification must run through the Class Station local authority during class time, using signed rotating nonces with replay rejection.
- AI generation must use RAG-style chunk retrieval instead of sending full PDFs to the model.
- Compliance logs must stream to an immutable WORM-capable external audit sink.

## 10. Offline QR Authority Was Added

The Face + QR classroom login flow was redesigned so it no longer depends on Supabase during class.

Student Hubs now have a local Class Station QR authority path. The Class Station can issue signed QR payloads, verify a face-confirmed QR session locally, reject replayed QR payloads, and return a signed unlock receipt.

Supabase is now treated as a deferred audit/sync destination for `qr_sessions`, not as the runtime dependency that unlocks students during a network outage.

Changed files:

- `src/lib/local-station-qr.ts`
- `src/app/api/local/qr/session/route.ts`
- `src/app/api/local/qr/verify/route.ts`
- `DETAILED_WORKING_REPORT.md`
- `DETAILED_WORKING_REPORT.pdf`
- `HARDWARE_TECHNICAL_DETAILS.md`
- `.gitignore`

## 11. Staff Credential Leak Was Removed

The staff creation API no longer returns the generated temporary password to the browser.

The Add Staff modal was also updated so principals can copy only non-secret login metadata. Temporary password delivery is now documented as secure-channel-only.

Changed files:

- `src/app/api/school/staff/create/route.ts`
- `src/features/staff-management/AddStaffModal.tsx`
- `DETAILED_WORKING_REPORT.md`

## 12. Build Verification Passed

The project was checked after the changes.

TypeScript passed.

Lint passed with only existing warnings.

Production build passed.

The local QR authority smoke test also passed: one signed QR session was accepted once, and the replay attempt was rejected.

## 13. Critical Audit Flaws Were Remediated In Code

The external architectural audit was reviewed and the directly actionable runtime flaws were patched.

Principal provisioning no longer accepts or exposes a human-entered initial password. The backend now generates the first password internally and creates a secure credential-delivery job, while the admin UI shows only the principal login code and delivery status.

The old cloud QR login endpoints were disabled. `/api/auth/qr/generate` and `/api/auth/qr/verify` now return `410 Gone`, and the student QR modal uses the local Class Station QR authority instead. This prevents the classroom Face + QR unlock flow from depending on Supabase during an internet outage.

The live test engine no longer joins predictable public `class_room_*` Realtime channels. Student Hubs now subscribe to private per-school, per-class, per-student topics, and a new Supabase migration adds RLS policies on `realtime.messages` so only the intended student can receive the live test broadcast.

The live test timer was hardened. Test payloads now carry server-issued `startsAt` and `endsAt` deadlines, local persistence stores those deadlines, and submissions include timing metadata such as `submitted_at`, `ends_at`, timer status, and late seconds. The sync API validates exam submissions and records server-side timing status instead of trusting only the browser countdown.

OTA update checks now respect maintenance windows. Routine device updates are deferred outside the configured OTA window, while mandatory updates can still be allowed. This prevents a large firmware update from disrupting morning classes.

Changed files:

- `src/app/api/school/provision/route.ts`
- `src/app/admin/(dashboard)/provision/page.tsx`
- `src/components/school/AuthModals.tsx`
- `src/app/api/auth/qr/generate/route.ts`
- `src/app/api/auth/qr/verify/route.ts`
- `src/features/student-portal/LiveTestEngine.tsx`
- `src/app/api/sync/events/route.ts`
- `src/app/api/hardware/update-check/route.ts`
- `supabase/migrations/20260502_credential_delivery_and_realtime_rls.sql`

## 14. Final Verification After Audit Fixes

The project was checked again after the audit remediation pass.

TypeScript passed with `npx tsc --noEmit`.

Lint passed with only existing warnings.

Production build passed with `npm run build`.

Local smoke checks passed:

- `/admin/provision` returned 200.
- `/school/student` returned 200.
- The deprecated `/api/auth/qr/generate` endpoint correctly returned 410.

## 15. IndexedDB Exam Vault Was Added

Round three infrastructure review identified the PWA RAM suspend risk on low-memory Student Hub devices.

The live test engine now writes exam state into an IndexedDB-backed local vault every time the student state changes. The existing `localStorage` mirror remains for fast synchronous reads, but IndexedDB is now the durable source used after browser tab refresh, PWA suspend, process kill, or device memory pressure.

On reload, the Student Hub now scans the IndexedDB vault for unfinished tests, rehydrates the exact saved answers, restores the server-issued deadline, resumes pending sync events, and continues the timer from disk-backed state.

This directly reduces the risk that a 60-minute live test is wiped when Android or the custom Hub OS suspends the browser process.

Changed files:

- `src/lib/live-test-vault.ts`
- `src/features/student-portal/LiveTestEngine.tsx`
- `TODAYS_CHANGES_REPORT.md`

Verification after this change:

- `npx tsc --noEmit` passed.
- `npm run lint` passed with only existing warnings.
- `npm run build` passed.
