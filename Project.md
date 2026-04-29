# EduPortal: The Multi-Tenant Educational Management Ecosystem

## 📌 Executive Summary
EduPortal is a high-performance, multi-tenant platform designed to orchestrate entire school ecosystems. It bridges the gap between massive cloud-scale administration and low-latency, offline-capable classroom execution on edge hardware (**EduOS Kiosks**). 

The platform implements **NEP 2020** mandates (National Education Policy) through 360-degree holistic progress cards, competency-based assessments, and a modular academic engine.

---

## 🏗️ Architectural Blueprint

### 1. The Cloud Layer (Control Tower)
Located at `/admin`, this is the platform owner's cockpit.
*   **Tenant Orchestration**: Managed via Route Groups `(auth)` and `(dashboard)`.
*   **School Lifecycle**: Handles registration, feature toggling (e.g., enabling AI, SMS, or Kiosk support), and subscription management.
*   **Global Config**: Kill-switch capabilities and platform-wide analytics.

### 2. The Institutional Layer (Staff Hub)
Located at `/school/dashboard/`, it separates operational concerns into three distinct roles:
*   **HOD / Principal (The Operations Hub)**:
    *   **Attendance Policy**: Switch between "Morning Roll Call" and "Subject-wise Tracking".
    *   **Staff CPD Tracker**: Real-time monitoring of teacher professional development hours (NEP mandate: 50h/year).
    *   **Priority Broadcasting**: Multi-channel announcements for campus-wide alerts.
*   **Moderator (The Content Engine)**:
    *   **Syllabus Digitization**: Structuring raw curriculum into machine-readable JSON for AI context.
    *   **Material Library**: Secure management of study materials with automatic synchronization to local Class Stations.
*   **Teacher (The Academic Engine)**:
    *   **AI Assessment Generator**: Utilizing Gemini to draft quizzes based strictly on moderator-vetted syllabus context.
    *   **Split-Screen Grading**: A physical-to-digital bridge allowing teachers to grade scanned worksheets alongside AI-suggested scores.
    *   **Live Monitoring**: Real-time status grid of up to 30 student hub devices in a single classroom.

### 3. The Edge Layer (Student Portal & EduOS)
Located at `/school/dashboard/student`, optimized for 7-10 inch touchscreens.
*   **My Desk**: A gesture-based UI for timetable tracking and announcement viewing.
*   **Live Test Engine**: A dedicated assessment runner that listens for `DEPLOY_TEST` broadcasts via Supabase Realtime.
*   **HPC Viewer**: A visual-first Progress Card (Radars/Mastery Circles) replacing traditional numerical marksheets.
*   **Offline-First**: Aggressive PWA caching of `.pdf` materials from the Supabase Storage bucket.

---

## 🗄️ Database Schema & RLS (Supabase)

### Core Tables:
*   `profiles`: Central user identity with `role` and `is_teaching_staff` flags.
*   `schools`: Tenant metadata including `school_code` and feature status.
*   `attendance`: Daily and subject-wise logs linked to students and schools.
*   `hpc_grades`: NEP-compliant competency records.
*   `student_sessions`: Heartbeat tracking for live classroom monitoring.
*   `materials`: Document library with `is_ai_indexed` status.

### Security Implementation:
*   **Silent Backend Creation**: Staff accounts provisioned via `/api/school/staff/create` using Service Role keys to prevent session hijacking.
*   **Hybrid Authorization**: Principals can toggle `is_teaching_staff` to access teacher tools while maintaining administrative authority.
*   **Tenant Isolation**: RLS policies ensure school data never leaks across tenant boundaries.

---

## 🤖 AI Integration (Gemini)
*   **Context Injection**: The `SyllabusManager` prepares the grounding context for Gemini.
*   **Workflow**: `Moderator Upload` -> `AI Indexing` -> `Teacher Prompting` -> `JSON Assessment Generation`.
*   **Prompting Strategy**: Focused on pedagogical alignment and NEP 2020 competency mapping.

---

## 📟 Hardware Specifications (EduOS)
*   **Kiosk Mode**: Standalone Chromium instances locked to the portal.
*   **Class Station**: Luckfox Edge node acting as a local relay for student heartbeats and offline material caching.
*   **Hub Connectivity**: ESP32/ARM-based student hubs connecting via local Class Station gateway.

---

## 🚀 Current Implementation Status

### ✅ Completed
- [x] Multi-tenant routing with Next.js Route Groups.
- [x] Admin School Profile Management (6-tab configuration).
- [x] Hybrid Principal-Teacher workflow and sidebar toggles.
- [x] Silent Staff Provisioning API.
- [x] Teacher Split-Screen Grading UI.
- [x] Student Portal with Live Test Engine (Supabase Realtime).
- [x] Auditor Compliance Health Map.
- [x] PWA Service Worker for offline PDF materials.

## 🚀 Project Roadmap & Milestones

#### 🏢 Phase 6: Admin Governance Hardening
- [x] **Batch Tenant Actions**: Implemented secure API (`/api/admin/schools/batch`) and UI toolbar for bulk status/config updates.
- [x] **Subscription Status Tracking**: Implemented non-financial tracking system for license monitoring.
- [x] **Global Support Ticketing**: Integrated `SupportTicketSystem` for direct HOD-to-Admin communication.
- [x] **The Master Promotion Switch**: Implemented global `is_promotion_open` toggle in Admin Settings.

#### 🏛️ Phase 7: Advanced Staff Operations
- [x] **Automated Compliance Reports**: Implemented `ComplianceReportGenerator` in the HOD dashboard for audit-ready exports.
- [x] **Biometric / Face-Sync Attendance**: Implemented `syncBiometricAttendance` data-bridge for hardware node integration.
- [x] **Teacher CPD Verification**: Established operational logic for staff development oversight.

#### 🍎 Phase 8: AI & Academic Intelligence
- [x] **Gemini-Assisted Subjective Grading**: Implemented AI Grading Bridge (`getAiGradingSuggestion`) for rubric-based scoring.
- [x] **Parent Portal Launch**: Established the portal structure for 360-degree student performance visibility.
- [x] **AI Career Pathing**: Logic established for NEP-aligned competency tracking and career suggestions.

#### 📟 Phase 9: EduOS & Hardware Orchestration
- [x] **Hardware Handshake Protocol**: Implemented secure `/api/hardware/handshake` for kiosk-to-tenant binding.
- [x] **Kiosk Lock-Down Hardening**: Hardened PWA Service Worker for offline resilience and asset security.
- [x] **Delta Background Sync**: Implemented intelligent caching for study materials and syllabus modules.

#### 💬 Phase 10: Unified Communication Ecosystem
- [x] **4-Tier Real-Time Chat Integration**: Implemented Supabase Realtime channels for isolated Classroom, School, Departmental, and Custom chats.
- [x] **Floating Global Chat UI**: Deployed the global `ChatDrawer` feature module across the Admin, Auditor, and School layers via RootLayout integration.
- [x] **Cross-Tenant RLS Chat Hardening**: Established strict Row Level Security policies to prevent cross-tenant messaging breaches.

#### 📸 Phase 11: Physical-to-Digital Edge Pipelines & Promotion
- [x] **Class Station Dual-Camera Scanner**: Integrated `MediaDevices` API for document capture on Teacher Kiosks.
- [x] **Handwriting OCR Engine**: Implemented `/api/ai/ocr` leveraging Gemini Vision for worksheet extraction.
- [x] **Promotion Execution Console**: Developed the authorized rollover UI for Principals, dependent on the Admin global window.

#### 🔄 Phase 12: Academic Year Rollover & Archival (Pending Development)
- [ ] **Data Archival Pipeline**: A Supabase Edge Function to move previous year logs (attendance, messages, sessions) to cold storage.
- [ ] **New Session Initialization**: A backend service that creates new class rosters and resets the school's "Live Monitor" grid for the upcoming year.

---

## 🛡️ Security Implementation
*   **Silent Backend Creation**: Staff accounts provisioned via `/api/school/staff/create` using Service Role keys to prevent session hijacking.
*   **Hybrid Authorization**: Principals can toggle `is_teaching_staff` to access teacher tools while maintaining administrative authority.
*   **Tenant Isolation**: RLS policies ensure school data never leaks across tenant boundaries.
