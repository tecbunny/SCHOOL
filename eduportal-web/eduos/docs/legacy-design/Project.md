# 🚀 EduPortal — Master Implementation Project Plan
## Project.md

> **Purpose:** This is the master blueprint that ties everything together. It outlines exactly **HOW** we will build the EduPortal ecosystem, including Plan 1 (School), Plan 2 (Admin), Plan 3 (Auditor), and the NEP 2020 integration.

---

## 📌 Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Tech Stack & Architecture](#2-tech-stack--architecture)
3. [The 3-Layer Ecosystem](#3-the-3-layer-ecosystem)
4. [Data Architecture (Supabase DB)](#4-data-architecture-supabase-db)
5. [Implementation Roadmap (Phases 1-6)](#5-implementation-roadmap)
6. [NEP 2020 Technical Implementation](#6-nep-2020-technical-implementation)
7. [AI Module Implementation](#7-ai-module-implementation)
8. [Real-time Chat System](#8-real-time-chat-system)
9. [Global ID & Numbering System](#9-global-id--numbering-system)
10. [Immediate Next Steps](#10-immediate-next-steps)

---

## 1. Executive Summary

We are building a comprehensive, multi-tenant school management platform fully compliant with India's NEP 2020. The system consists of three distinct layers:
*   **The Control Layer (Admin):** Manages which schools are on the platform.
*   **The Operational Layer (School):** Where students, teachers, and principals interact daily.
*   **The Observation Layer (Auditor):** Read-only dashboards for performance monitoring.

We will build this as a high-fidelity frontend using **HTML/CSS/JS** connected directly to a **Supabase (PostgreSQL)** backend for real-time data persistence, secure authentication, and Row-Level Security (RLS).

---

## 2. Tech Stack & Architecture

### 2.1 Core Technologies
*   **Structure:** HTML5 (Semantic, Accessible)
*   **Styling:** Vanilla CSS (CSS Variables for theming, Flexbox/Grid for layout). *No Tailwind/Bootstrap to ensure maximum customizability and a unique premium feel.*
*   **Logic & State:** Vanilla JavaScript (ES6+).
*   **Database & Auth:** Supabase (PostgreSQL, Realtime Subscriptions, Authentication, Storage buckets).
*   **Icons:** Lucide Icons (via CDN).
*   **Charts:** Chart.js (via CDN) for dashboards and analytics.
*   **Fonts:** Google Fonts (Inter for UI, maybe a secondary font for headings).

### 2.2 Design Philosophy
*   **Glassmorphism & Neumorphism accents:** Premium, modern feel.
*   **Dark Mode First (or highly polished Light/Dark toggle):** Distinct color palettes for each layer (Indigo/Amber for School, Sky Blue/Violet for Admin, Teal/Indigo for Auditor).
*   **Micro-interactions:** Smooth hover states, page transitions, and toast notifications.

---

## 3. The 3-Layer Ecosystem

```mermaid
graph TD
    A[Plan 2: Super Admin] -->|Creates & Configures| B(Plan 1: School A)
    A -->|Creates & Configures| C(Plan 1: School B)
    A -->|Assigns| D[Plan 3: Auditor]
    D -.->|Observes (Read-Only)| B
    D -.->|Observes (Read-Only)| C
```

1.  **`admin/` (Plan 2):** Platform owner controls subscriptions, feature toggles (AI, Quiz), and generates school codes.
2.  **`school/` (Plan 1):** The actual school portal. Users log in using a School Code + Role ID. Features change dynamically based on Admin toggles and NEP stage (Foundational vs. Secondary).
3.  **`auditor/` (Plan 3):** Inspectors log in to view aggregated data, generate watermarked reports, and check NEP compliance.

---

## 4. Data Architecture (Supabase DB)

We will structure our Supabase PostgreSQL database using highly relational tables with strict Row-Level Security (RLS) to ensure data isolation between schools.

### Supabase Tables:
*   `db_platform_settings`: Global AI toggles, NEP defaults.
*   `db_schools`: Registry of all schools (id, name, status, features enabled, NEP stages active).
*   `db_users`: All users across all schools (id, schoolId, role, name, credentials).
*   `db_academic_records`: Grades, formative/summative marks, HPC (Holistic Progress Card) entries.
*   `db_attendance`: Daily/Subject-wise attendance records.
*   `db_materials`: Moderator uploaded syllabus and notes.
*   `db_papers`: Manually/AI created exams, quizzes, and rapid tests.
*   `db_auditors`: Auditor assignments and saved reports.
*   `db_chat_rooms` & `db_chat_messages`: Real-time messaging spanning all 3 layers.

---

## 5. Implementation Roadmap

We will build the system in **6 iterative phases**.

### Phase 1: Foundation & Design System (Days 1-2)
*   Setup project folder structure (`admin/`, `school/`, `auditor/`, `css/`, `js/`).
*   Create `global.css` (CSS variables, typography, reset).
*   Build common UI components (Buttons, Inputs, Cards, Modals, Toast notifications).
*   Implement `supabaseClient.js` (initialize connection to handle Auth and DB CRUD operations).

### Phase 2: The Control Tower — Plan 2 Admin (Days 3-4)
*   Build Admin Login.
*   Build Admin Dashboard (Stats, Charts).
*   Build School Management (Create School, Generate Code, Toggle Features).
*   *Milestone: Admin can successfully create a school in the Supabase DB.*

### Phase 3: School Core Operations — Plan 1 (Days 5-7)
*   Build unified School Login (requires School Code).
*   Build HOD/Principal Dashboard (SMC tools, School settings like Attendance Mode).
*   Build Moderator Dashboard (Upload syllabus, materials).
*   Build Teacher Dashboard (My Classes, basic attendance).
*   Build Student Dashboard (Timetable, view materials).

### Phase 4: NEP 2020 & Academic Engine — Plan 1 (Days 8-10)
*   **Grade Entry System:** Teacher UI for entering Formative/Summative marks. Auto-calculation of CBSE grades.
*   **Holistic Progress Card (HPC):** Build the 360-degree report card UI for Students. Include self/peer assessment submission forms.
*   **Teacher CPD:** Add CPD hours tracker to Teacher dashboard.
*   **Paper Creator:** Build the UI for manual creation of Exams/Quizzes.

### Phase 5: The Observer — Plan 3 Auditor (Days 11-12)
*   Build Auditor Login.
*   Build Auditor Dashboard (Cross-school health map).
*   Build detailed read-only performance views (Academic, Attendance, Teacher Activity).
*   Build Report Generator (Printable watermarked PDF views).

### Phase 6: AI Integration & Polish (Days 13-14)
*   Implement `ai.js` (Connect to Gemini API or Supabase Edge Functions for generation).
*   Integrate AI Draft generation into the Paper Creator.
*   Integrate AI Topic Explainer.
*   Final UI polish, responsive design checks, and animation tuning.

---

## 6. NEP 2020 Technical Implementation

How we translate the NEP policy into code:

1.  **5+3+3+4 Dynamic UI:** When creating a school, Admin selects stages. If a school only has "Foundational" (Class 1-2), the Teacher grade entry UI switches from "Marks Input" to "Competency Level Selectors" (Beginning, Developing, Meeting, Exceeding).
2.  **Holistic Progress Card (HPC):** The report card view pulls data from multiple keys: `db_academic_records` (40%), `db_formative` (30%), `db_peer_reviews` (10%), etc., to render the 360-degree chart.
3.  **CBSE Grading:** A utility function in `app.js`: `calculateGrade(marks, total)` that returns A1, B2, etc., based on the NEP scale.
4.  **Attendance Thresholds:** Hardcode the 75% CBSE benchmark. Any calculation resulting in `< 75%` automatically applies a `.danger-text` CSS class.

---

## 7. AI Module Implementation

We will integrate the AI module (e.g., Gemini API) via Supabase Edge Functions or secure serverless calls to prevent exposing API keys.

```javascript
// Example of ai.js structure via Supabase Edge Function
const AI_MODULE = {
    generatePaper: async function(subject, topics, difficulty) {
        const { data, error } = await supabase.functions.invoke('generate-test', {
            body: { subject, topics, difficulty }
        });
        
        if (error) throw new Error('AI generation failed');
        return data;
    }
}
```
*   The UI will show a loading spinner while the Edge Function processes the prompt.

---

## 8. Real-time Chat System

A comprehensive 4-tier communication system powered by Supabase Realtime spans the entire platform:
1. **Classroom Chats:** Teacher + Students
2. **School Chats:** Principal/Moderator + Teachers + Students
3. **Departmental Chats:** Admin + Auditor + Principal + Teachers
4. **Custom Chats:** Admin + Anyone (Strictly NO STUDENTS)

> *See `Chat_System.md` for full database schemas, UI mechanics, and access rules.*

---

## 9. Global ID & Numbering System

To ensure consistency across the entire platform, all entities will follow a strict ID formatting standard.

| Entity | ID Format | Example | Description |
|--------|-----------|---------|-------------|
| **Auditor** | `AUXXXXX` | `AU00001` | Starts with AU + 5 digits |
| **Super Admin** | `ADXXXXX` | `AD00001` | Starts with AD + 5 digits |
| **School** | `SCHXXXX` | `SCH7878` | Starts with SCH + 4 digits |
| **Principal / HOD** | `PRXXXXX` | `PR00001` | Starts with PR + 5 digits |
| **Teacher** | `TXXXXXX` | `T000001` | Starts with T + 6 digits |
| **Moderator** | `MDXXXXX` | `MD00001` | Starts with MD + 5 digits |
| **Student** | `[SCH#][YY][UID]` | `78782609341` | School Code (4) + Year (2) + Unique ID (5) |
| **Test / Paper** | `TEST[TCH#][UID]`| `TEST0000011234` | TEST + Teacher 6-digit number + 4-digit Unique ID |

> **Student Login Exception:** While other roles log in via their respective portals using name/designation/code combinations, **Students have a unique secure login portal** where they log in strictly using their **11-digit Student Code + Password**.

---

## 10. Immediate Next Steps

**To begin execution, we will start with Phase 1:**

1.  Create the directory structure.
2.  Create `index.html` (Landing Page navigating to Admin/School/Auditor logins).
3.  Create `css/global.css` and define the root design system (colors, fonts, shadows).
4.  Setup Supabase Project and create `js/supabaseClient.js` to initialize the database connection.

*Project Blueprint Finalized. Ready for Code.*
