# EduPortal Feature Status

Last reviewed: 2026-05-03

Latest implementation pass: 2026-05-03

EduPortal is a Next.js and Supabase school operations platform for admins, auditors, schools, teachers, students, alumni, and connected EduOS edge devices. This document separates features that are implemented in the current codebase from features that are partially implemented or planned next.

## Implemented Features

### 1. Public Product Entry

- Landing page for EduPortal with gateway links for school, teacher, AI tools, and student workflows.
- Responsive marketing/product overview with direct navigation into working app areas.
- Theme toggle and shared brand styling.

### 2. Role-Based Access And Navigation

- Separate app areas for admin, auditor, school, teacher, and student roles.
- Role-aware middleware redirects users to the correct dashboard.
- Supabase session checks for protected routes.
- Shared sidebar navigation with role-specific menu items.
- Sign-out support from the sidebar.

### 3. Admin Control Center

- Admin dashboard shell with navigation for platform operations.
- Institution management pages.
- School detail page.
- User/account management page.
- Subscription and tenant plan page.
- Inbound registration/request management.
- Global analytics page.
- Platform settings page.
- Security logs page.

### 4. School Provisioning

- API support for creating and provisioning schools.
- API support for batch school creation.
- Registration request flow for new institutions.
- Principal password reset flow using short-lived admin authorization codes.
- Staff password reset API using admin authorization.
- Credential delivery job table for safer credential handling.

### 5. School Gateway

- School gateway screen with entry points for Staff Station and Student Hub.
- EduOS simulation redirect support through query/cookie context.
- Boot splash support for simulated EduOS device mode.
- Staff entry page.
- Teacher entry page.
- Student entry page.

### 6. Teacher Workspace

- Teacher dashboard route and layout.
- Classroom tools component.
- Class analytics component.
- Worksheet scanner component.
- Split-screen grading interface.
- Assignment grading route using dynamic assignment IDs.
- AI grading suggestion bridge through `/api/ai/vision-grade`.
- AI paper/content generation through `/api/ai/generate`.
- OCR endpoint through `/api/ai/ocr`.

### 7. Student Portal

- Student dashboard route.
- Student desk component.
- Study hub component.
- Dedicated Study Hub route at `/school/dashboard/student/study-hub`.
- Live test engine component.
- Holistic Progress Card viewer.
- Dedicated Holistic Card route at `/school/dashboard/student/holistic-card`.
- Digital ID card component.
- Dedicated Assignments route at `/school/dashboard/student/assignments`.
- Dedicated Class Timetable route at `/school/dashboard/student/timetable`.
- Dedicated Peer Reviews route at `/school/dashboard/student/peer-reviews`.
- Student sidebar links now route to real pages instead of placeholder anchors.
- Student stats service for attendance, grades, and competency mastery.
- APAAR link API endpoint.

### 8. HOD, Moderator, And Alumni Areas

- HOD dashboard route.
- HOD snapshots route.
- Moderator dashboard route.
- Alumni dashboard route.
- Attendance mode configuration component.
- Timetable manager component wired to the existing `public.timetable` schema.
- Promotion console component.

### 9. Academic Operations

- Attendance records table.
- HPC grade records table.
- HPC competency tracking table.
- CPD logs table.
- Timetable table and service.
- Syllabus table and syllabus manager.
- Study materials table and material uploader.
- Exam paper table.
- Class promotion service with promotion history logging.
- School stats, teacher stats, student stats, and global stats services.

### 10. NEP 2020 And Compliance

- NEP 2020 compliance card component.
- Compliance report generator.
- Engagement heatmap component.
- HPC analytics component.
- Auditor login page.
- Auditor dashboard route.
- Dedicated Compliance Check route at `/auditor/dashboard/compliance-check`.
- Dedicated Institutional Logs route at `/auditor/dashboard/institutional-logs`.
- Dedicated Certifications route at `/auditor/dashboard/certifications`.
- Auditor sidebar links now route to real oversight pages instead of placeholder anchors.
- Auditor compliance health map.
- Auditor report generator.

### 11. Realtime Chat And Collaboration

- Chat rooms, chat messages, and chat participants schema.
- Supabase realtime enabled for chat messages.
- Global chat drawer.
- Chat sidebar.
- Message bubble component.
- Realtime chat hook.
- Room participant-based row-level security.

### 12. Announcements

- Announcement composer.
- Announcement feed.
- Announcement service for posting and fetching announcements.
- Tenant-scoped announcement policies for admins and principals.

### 13. Content Management

- Study material upload to Supabase Storage.
- Material metadata persistence.
- Subject, class, and material type fields.
- Materials listing service.
- Syllabus progress display.

### 14. Hardware And EduOS Edge Support

- EduOS build scripts.
- Student Hub image payload.
- Class Station image payload.
- Generated role images:
  - `eduos/images/student-hub-v1.0.0.img`
  - `eduos/images/class-station-v1.0.0.img`
- VM helper scripts for testing Student Hub and Class Station.
- Edge server Docker and Nginx files.
- Hardware handshake API.
- Hardware telemetry API.
- Hardware update-check API.
- Hardware key registration API.
- Hardware face verification API.
- Device context utilities.
- Hardware authentication helper with signed request and replay protection support.

### 15. Offline And Sync Engine

- Offline event schema.
- Device Lamport clock tracking.
- Offline event hashing.
- Append-only offline event function.
- Sync events API.
- Grade edge versioning with monotonically increasing version counts.
- Grade merge function for teacher-edge edits.

### 16. QR And Local Station Access

- Auth QR generation API.
- Auth QR verification API.
- Local QR session API.
- Local QR verification API.
- Code login API.
- Gate login and gate token APIs.
- Local station QR helper.

### 17. Student Hub Distribution Mode

- Hub distribution UI component.
- Student hub checkout schema.
- Active hub checkout constraints.
- Teacher-managed hub checkout policies.
- Support for checkout, lock, return, and missing states in the database model.

### 18. Security And Data Protection

- Supabase row-level security across core tables.
- Auth helper schema for role and school isolation.
- Admin-only school and platform management policies.
- Tenant-scoped data access for school users.
- Private realtime policies for live-test broadcasts.
- Hardware request nonce table.
- Face template and verification attempt tables.
- Credential delivery jobs instead of exposing temporary credentials directly.
- Rate-limit utility.

### 19. Support Operations

- Support ticket schema.
- Support ticket system component.
- Offline health dashboard component.
- Admin fleet and edge-node pages.
- Fleet deployment service hook for OTA update requests.

### 20. Build And Delivery

- Next.js production build scripts.
- ESLint script.
- Supabase SQL setup script.
- Supabase maintenance reset script.
- Supabase Edge Function for HPC aggregation.
- Pitch deck artifact for investor/demo presentation.
- Production build verified successfully after the latest route and timetable updates.

## Partially Implemented Features

These features have visible routes, components, APIs, or database structures, but need more production wiring, data flows, or UX completion.

### 1. AI Analytics

- Current analytics services read live Supabase data for many metrics.
- Some class mastery logic is still marked as mock-backed aggregation.
- Next step: replace all mock calculations with validated rollups, scheduled aggregation, and clear empty-state behavior.

### 2. Assignment Workflow

- Student assignment board route exists and can surface recent teacher-generated exam papers as actionable assignment items.
- Fallback assignment cards keep the screen usable when assignment tables are not seeded yet.
- Next step: add first-class assignment and submission tables, teacher assignment authoring, file submission storage, grading states, and notifications.

### 3. Timetable Workflow

- Student class timetable route exists and reads from the current `public.timetable` table.
- HOD timetable manager now uses the same table name and realtime channel.
- Next step: add staff timetable route, period creation modal, room inventory, substitution notifications, and conflict tests.

### 4. Peer Review Workflow

- Student peer-review route exists with 360-degree feedback cards, recent peer notes, and recognition summary.
- Next step: add peer review tables, review collection forms, moderation, and rollup into HPC competency scoring.

### 5. Auditor Oversight Workflow

- Auditor compliance check, institutional logs, and certifications routes exist.
- Auditor navigation now links to real pages.
- Next step: connect institutional logs and certifications to persistent audit/certification tables and signed evidence exports.

### 6. AI Analytics

- Current analytics services read live Supabase data for many metrics.
- Some class mastery logic is still marked as mock-backed aggregation.
- Next step: replace all mock calculations with validated rollups, scheduled aggregation, and clear empty-state behavior.

### 7. Hardware Fleet Management

- Hardware APIs, telemetry, update checks, signed requests, and fleet deployment hooks exist.
- Admin fleet and node screens exist.
- Next step: complete OTA release management, node health timelines, failure recovery, and device command audit trails.

### 8. Face Verification

- Face template and verification attempt schema exists.
- Face verification API exists.
- Next step: finalize enrollment UX, embedding model pipeline, threshold tuning, and admin review workflows.

### 9. Live Tests

- Live test engine component and private realtime policy foundations exist.
- Next step: complete teacher test authoring, private broadcast flow, student response capture, scoring, and post-test reports.

### 10. Hub Distribution

- Hub checkout schema and UI component exist.
- Next step: connect QR scan flow, session-level inventory screen, lost-device handling, and return verification.

### 11. Credential Delivery

- Credential delivery jobs and admin authorization codes exist.
- Next step: integrate actual delivery channels such as verified contact, email, or SMS provider.

### 12. EduOS Packaging

- Build scripts and generated role images exist.
- Next step: automate release signing, version manifest publishing, OTA rollout channels, and rollback.

## Planned / Recommended Next Features

### Phase 1: Complete Core School Workflows

- Assignment data model with teacher creation, student submission, grading, and status tracking.
- Staff timetable route with creation, substitution, and notification flows.
- Attendance marking UI for morning and subject-wise attendance.
- Parent/guardian contact records and communication logs.
- Class-wise dashboards for HOD and principal users.

### Phase 2: Strengthen Academic Intelligence

- Production HPC aggregation jobs.
- Competency rubric builder.
- Student progress trend charts.
- Persistent peer review collection, moderation, and HPC rollup.
- AI-generated remediation plans.
- Teacher workload and CPD progress dashboards.

### Phase 3: Finish Live Test System

- Teacher live test authoring.
- Question bank and paper templates.
- Realtime student response tracking.
- Auto-scoring and manual override.
- Anti-cheat/session integrity checks.
- Result export for teachers and principals.

### Phase 4: Complete Device Operations

- Hardware enrollment wizard.
- QR-based Student Hub assignment and return flow.
- Device health timeline.
- OTA release dashboard.
- Signed firmware/update manifest.
- Device command queue visibility.
- Offline conflict resolution UI.

### Phase 5: Expand Compliance And Auditing

- Persistent institutional logs backed by audit tables.
- Persistent certification tracker backed by certification tables.
- Evidence upload and review workflow.
- NEP 2020 checklist mapping.
- Scheduled compliance reports.
- School-level audit history.

### Phase 6: Production Readiness

- End-to-end tests for admin, teacher, student, and auditor flows.
- Seed data for demo schools, users, classes, and devices.
- Error monitoring and structured logging.
- Backup and restore documentation.
- Environment setup guide.
- Deployment checklist for Vercel and Supabase.

## Suggested Priority Order

1. Add persistent assignment, submission, peer review, audit log, and certification tables.
2. Replace mock analytics calculations with production aggregations.
3. Complete teacher assignment authoring, attendance, and staff timetable workflows.
4. Finish live test teacher-to-student flow.
5. Complete EduOS device enrollment, hub checkout, and OTA management.
6. Add tests and demo seed data for repeatable investor/customer demos.

## Current Technical Stack

- Frontend: Next.js, React, TypeScript.
- Styling: global CSS with custom design tokens and responsive layouts.
- Backend: Next.js API routes.
- Database/Auth/Realtime/Storage: Supabase.
- AI: Google Generative AI integration.
- Charts: Chart.js and Recharts.
- QR: `qrcode.react` and `html5-qrcode`.
- Icons: Lucide React.
- Edge/device support: EduOS scripts, Docker, Nginx, Supabase-backed hardware APIs.
