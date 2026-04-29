# 🔍 EduPortal — Auditor Dashboard
## Plan 3 · Auditor.md

> **What is Plan 3?**
> A read-only performance monitoring dashboard for external auditors,
> government inspectors, board members, or the platform owner to evaluate
> school performance without interfering with school operations.

---

## 📌 Table of Contents

1. [Who is the Auditor?](#1-who-is-the-auditor)
2. [System Position](#2-system-position)
3. [Auditor Types & Access Levels](#3-auditor-types--access-levels)
4. [Core Rules](#4-core-rules)
5. [Pages & Routes](#5-pages--routes)
6. [Dashboard Overview](#6-dashboard-overview)
7. [School Performance View](#7-school-performance-view)
8. [Academic Performance Module](#8-academic-performance-module)
9. [Attendance Audit Module](#9-attendance-audit-module)
10. [Teacher Performance Module](#10-teacher-performance-module)
11. [Comparative Analysis](#11-comparative-analysis)
12. [Audit Reports](#12-audit-reports)
13. [UI/UX Design System](#13-uiux-design-system)
14. [File & Folder Structure](#14-file--folder-structure)
15. [Data Models](#15-data-models)
16. [Development Phases](#16-development-phases)

---

## 1. Who is the Auditor?

| Type | Example | Scope |
|------|---------|-------|
| **Government Inspector** | Education board official | Assigned school(s) |
| **External Evaluator** | NGO / Accreditation body | Assigned school(s) |
| **Board Member** | School trust / management board | One school |
| **Platform Owner** | You (EduPortal) | All schools |
| **Internal Auditor** | School chain head | Their group of schools |

---

## 2. System Position

```
┌─────────────────────────────────────────────┐
│         PLATFORM LAYER                      │
│  Plan 2 — Admin Dashboard (manages)         │
│         ↓ assigns auditor access            │
├─────────────────────────────────────────────┤
│         AUDIT LAYER  ◄── Plan 3             │
│  Auditor Dashboard (observes only)          │
│         ↓ reads data from                   │
├─────────────────────────────────────────────┤
│         SCHOOL LAYER                        │
│  Plan 1 — School Web App (operates)         │
└─────────────────────────────────────────────┘
```

### Key Principle
> **Auditor can ONLY VIEW. Cannot edit, post, upload, or change anything.**
> The dashboard is 100% read-only.

---

## 3. Auditor Types & Access Levels

| Auditor Type | Schools Visible | Data Access |
|-------------|:--------------:|-------------|
| **Super Auditor** | All schools | Full platform data |
| **Multi-School Auditor** | Assigned group | Full data for those schools |
| **Single-School Auditor** | One school only | Full data for that school |
| **Subject Auditor** | One school | Only one subject's data |

> Admin (Plan 2) assigns the auditor and defines their scope.

### Permissions — Auditor has NO write access

| Action | Auditor |
|--------|:-------:|
| View school performance | ✅ |
| View student grades | ✅ (aggregate only, no names*) |
| View attendance rates | ✅ |
| View teacher activity | ✅ |
| View materials uploaded | ✅ |
| View test/exam results | ✅ |
| Generate audit reports | ✅ |
| Export data (CSV/PDF) | ✅ |
| Post announcements | ❌ |
| Edit any data | ❌ |
| See student PII (names) | ❌ by default* |
| See teacher contact info | ❌ |

> *Student names can be toggled ON for Single-School Auditors by Admin — off by default for privacy.

---

## 4. Core Rules

1. **Read-only always** — No create, edit, delete buttons anywhere
2. **Privacy by default** — Student names hidden; only Roll No or anonymized ID shown
3. **Scope-locked** — Auditor only sees schools/subjects assigned by Admin
4. **Audit trail** — Every page the auditor visits is logged (timestamp + page)
5. **No cross-contamination** — Multi-school auditor cannot compare schools not in their scope
6. **Watermarked exports** — All PDFs include auditor name + date + "Confidential"

---

## 5. Pages & Routes

| Page | Route | Purpose |
|------|-------|---------|
| Login | `/auditor/login` | Auditor login |
| Dashboard | `/auditor/` | Overview of assigned schools |
| School List | `/auditor/schools` | All assigned schools |
| School Report | `/auditor/schools/[id]` | Full performance report |
| Academic | `/auditor/schools/[id]/academic` | Grades & results |
| Attendance | `/auditor/schools/[id]/attendance` | Attendance audit |
| Teachers | `/auditor/schools/[id]/teachers` | Teacher activity |
| Materials | `/auditor/schools/[id]/materials` | Content coverage |
| Compare | `/auditor/compare` | Side-by-side school comparison |
| Reports | `/auditor/reports` | Generated audit reports |

---

## 6. Dashboard Overview

### 6.1 Summary Cards (Assigned Schools)

| Card | Data |
|------|------|
| Schools Assigned | e.g., 5 |
| Avg Attendance (all) | e.g., 88.4% |
| Avg Academic Score / CGPA | e.g., 74.2% (or 7.8 CGPA) |
| NEP Compliance Score | e.g., 92% |
| Schools Below Threshold | e.g., 2 (flagged) |
| Last Audit Date | e.g., 28 Apr 2026 |

### 6.2 Performance Health Map

Table of assigned schools with color-coded health:

| School | Attendance | Academic | Teacher Activity | Overall Health |
|--------|:----------:|:--------:|:----------------:|:--------------:|
| St. Mary's | 92% 🟢 | 78% 🟢 | High 🟢 | 🟢 Good |
| Sunrise Academy | 71% 🔴 | 61% 🟠 | Low 🔴 | 🔴 At Risk |
| Delhi Public | 85% 🟢 | 70% 🟠 | Medium 🟡 | 🟡 Fair |

### 6.3 Threshold Alerts

> Auditor sets thresholds (or uses defaults):
- Attendance below **75% (CBSE rule)** → 🔴 flagged
- Class average below **50%** → 🔴 flagged
- Teacher CPD hours < 50/year pace → 🔴 flagged
- Teacher posting < 2 assignments/month → 🟠 flagged
- Subjects with no materials uploaded → 🟠 flagged

### 6.4 Quick Charts
- Radar chart: School health across 5 dimensions
- Bar chart: All schools attendance comparison
- Line chart: Academic trend over last 3 months

---

## 7. School Performance View

Single school full report — tabs:

| Tab | Content |
|-----|---------|
| 📊 **Overview** | Summary KPIs, trend charts, flags |
| 📈 **Academic** | Class-wise, subject-wise grades |
| 📆 **Attendance** | Overall + subject-wise (if Mode B) |
| 👩‍🏫 **Teachers** | Activity, assignments posted, grades entered |
| 📚 **Materials** | Content coverage by subject |
| 🗒️ **Audit Notes** | Auditor's own private notes |

---

## 8. Academic Performance Module

### 8.1 Class-wise Performance Table

| Class (Stage) | Total Students | Pass % | Avg Score / CGPA | Formative % | Summative % |
|---------------|:--------------:|:------:|:----------------:|:-----------:|:-----------:|
| 10-A (Secondary) | 42 | 95% | 7.8 CGPA | 82% | 75% |
| 10-B (Secondary) | 40 | 87% | 7.1 CGPA | 74% | 68% |
| 5-A (Preparatory) | 38 | 91% | 74.6% | 88% | 70% |

### 8.2 Subject-wise Performance

| Subject | Teacher | Classes Taught | Avg Score | Pass % | Trend |
|---------|---------|:--------------:|:---------:|:------:|:-----:|
| Mathematics | Mrs. Nair | 10-A, 10-B | 72% | 88% | 📈 Up |
| Science | Mr. Kumar | 10-A | 81% | 96% | ➡️ Stable |
| English | Ms. Roy | 10-A, 10-B, 9-A | 68% | 82% | 📉 Down |

### 8.3 Grade Distribution Chart
- Bell curve / bar chart showing grade distribution (A / B / C / D / Fail)
- Filterable by class and subject

### 8.4 Exam vs Test Comparison
- Compare student performance: Rapid Test vs Final Exam
- Identify improvement or decline patterns

### 8.5 Underperforming Students (anonymized)
- Count of students below 40% per subject
- No names shown by default — only Roll No

---

## 9. Attendance Audit Module

### 9.1 Overall Attendance Summary

| Month | School Avg | Classes < 75% | Improvement |
|-------|:----------:|:-------------:|:-----------:|
| Feb 2026 | 86% | 2 | — |
| Mar 2026 | 83% | 4 | 📉 -3% |
| Apr 2026 | 88% | 1 | 📈 +5% |

### 9.2 Class-wise Attendance Table

| Class | Teacher | Total Days | Avg Attendance | Chronic Absentees |
|-------|---------|:----------:|:--------------:|:-----------------:|
| 10-A | Mrs. Nair | 20 | 92% | 2 students |
| 10-B | Mr. Sharma | 20 | 74% | 🔴 7 students |

### 9.3 Subject-wise (Mode B only)
- If school uses subject-wise attendance → shows per subject
- Identify which subjects have consistently low presence

### 9.4 Attendance Trend Chart
- Monthly line chart across the academic year
- Overlay: exam months, holidays

### 9.5 Flags
- Classes with < 75% average → highlighted in red
- Students with < 60% attendance → counted (anonymized)

---

## 10. Teacher Performance Module

> Measures activity — not personal data.

### 10.1 Teacher Activity Summary

| Teacher | Subject | Assignments Posted | HPCs Completed | CPD Hours | Last Active |
|---------|---------|-----------------:|:--------------:|:---------:|:-----------:|
| Mrs. Nair | Math | 8 | 100% ✅ | 42/50 hrs 🟢 | Today |
| Mr. Roy | English | 2 | 45% 🟠 | 10/50 hrs 🔴 | 5 days ago |

### 10.2 Activity Score (Auto-calculated)
Formula:
```
Activity Score =
  (Assignments posted / Expected) × 30%  +
  (Grades entered / Assignments) × 30%   +
  (Attendance marked / Working days) × 40%
```
Score: 🟢 80–100 · 🟡 60–79 · 🔴 Below 60

### 10.3 Content Contribution
- Did the teacher upload any materials? (if Moderator role not separate)
- Tests/quizzes created per month

---

## 11. Comparative Analysis

> Available only if auditor has access to 2+ schools.

### 11.1 Side-by-Side School Comparison

| Metric | St. Mary's | Sunrise Academy | Delhi Public |
|--------|:----------:|:---------------:|:------------:|
| Avg Attendance | 92% 🟢 | 71% 🔴 | 85% 🟢 |
| Avg Academic Score | 78% 🟢 | 61% 🟠 | 70% 🟡 |
| Pass Rate | 94% | 78% | 88% |
| Teacher Activity | High | Low | Medium |
| Materials Coverage | 90% | 55% | 75% |
| Overall Rank | #1 | #3 | #2 |

### 11.2 Benchmark Lines
- Draw a horizontal benchmark line on charts (e.g., 80% attendance target)
- Quickly see which schools are above/below target

### 11.3 Subject Comparison Across Schools
- Select subject: "Mathematics"
- See all schools' Math average side by side

---

## 12. Audit Reports

### 12.1 Report Types

| Report | Contents |
|--------|---------|
| **Full School Audit** | All modules — academic, attendance, teachers, materials |
| **Academic Report** | Grades, pass rates, subject-wise analysis |
| **Attendance Report** | Monthly trend, class-wise, flags |
| **Teacher Activity Report** | Activity scores, flags |
| **Comparative Report** | Multi-school comparison |
| **Custom Report** | Auditor selects which sections to include |

### 12.2 Report Generation Flow
```
Auditor selects: Report Type + School(s) + Date Range
         ↓
System compiles data from Supabase
         ↓
Preview shown on screen
         ↓
Options: Print | Download PDF | Save as Draft
         ↓
Report saved with: Auditor name + Date + School + "Confidential" watermark
```

### 12.3 Saved Reports
- List of all previously generated reports
- Filter by school, date, type
- Reopen / Reprint any past report

### 12.4 Auditor Notes
- Private text notes per school
- Not visible to school staff or Admin
- Visible only to the same auditor
- Saved in Supabase

---

## 13. Real-time Chat System (Auditor)

Auditors have access to the global floating chat drawer (💬). They cannot create chats, but they can participate in chats created by the Admin.

*   **Departmental Chats:** Auditor can discuss compliance/findings with the Admin, Principal, and specific Teachers.
*   **Custom Chats:** Auditor can be added to custom discussion groups by the Admin.

> **See `Chat_System.md` for full implementation details and cross-layer chat rules.**

---

## 14. UI/UX Design System

### Color Palette (Auditor — professional, neutral tone)

| Token | Color | Usage |
|-------|-------|-------|
| `--audit-primary` | `#0F766E` (Teal) | Buttons, active nav |
| `--audit-secondary` | `#6366F1` (Indigo) | Charts, highlights |
| `--success` | `#10B981` (Green) | Good performance |
| `--warning` | `#F59E0B` (Amber) | Fair / borderline |
| `--danger` | `#EF4444` (Red) | At risk / flagged |
| `--bg-dark` | `#0F172A` | Background |
| `--card-dark` | `#1E293B` | Cards |
| `--border` | `#334155` | Dividers |

> Teal palette = neutral, professional, "inspector" feel — distinct from Plan 1 & Plan 2.

### Key Components
| Component | Used In |
|-----------|---------|
| Health Badge | School list, overview table |
| Radar Chart | School multi-dimension overview |
| Comparison Table | Side-by-side analysis |
| Threshold Alert Banner | Flagged schools/classes |
| Progress Bar | Attendance %, pass rate |
| Watermarked Print View | All exported reports |
| Private Notes Field | Per-school auditor notes |
| Date Range Picker | Filter all data by period |
| Read-only Data Table | All data views |

---

## 15. File & Folder Structure

```
SCHOOL/
│
├── auditor/
│   ├── index.html              ← Auditor Login
│   ├── dashboard.html          ← Overview of assigned schools
│   ├── schools.html            ← School list
│   ├── school-report.html      ← Full school performance report
│   ├── compare.html            ← Side-by-side comparison
│   ├── reports.html            ← Saved reports list
│   │
│   ├── auditor-style.css       ← Auditor-specific styles
│   └── auditor.js              ← Auditor logic + Supabase Client
│
├── admin/                      ← Plan 2
├── index.html                  ← Plan 1
├── School.md
├── Admin.md
└── Auditor.md                  ← This document
```

---

## 16. Data Models

### Auditor Account
```json
{
  "id": "AU00001",
  "name": "Dr. Meena Pillai",
  "email": "meena@educationboard.gov.in",
  "type": "Multi-School Auditor",
  "assignedSchools": ["SCH7878", "SCH7879", "SCH7880"],
  "assignedSubjects": null,
  "canViewStudentNames": false,
  "createdBy": "AD00001",
  "lastLogin": "2026-04-28T09:30:00"
}
```

### School Performance Snapshot
```json
{
  "schoolId": "SCH7878",
  "period": "2026-04",
  "avgAttendance": 88.4,
  "avgAcademicScore": 74.2,
  "passRate": 92,
  "teacherActivityScore": 81,
  "materialsCoverage": 78,
  "flaggedClasses": ["10-B"],
  "flaggedSubjects": ["English"],
  "overallHealth": "Good"
}
```

### Audit Report
```json
{
  "id": "RPT-0012",
  "auditorId": "AU00001",
  "schoolId": "SCH7878",
  "type": "Full School Audit",
  "dateRange": { "from": "2026-04-01", "to": "2026-04-28" },
  "generatedAt": "2026-04-28T11:00:00",
  "sections": ["academic", "attendance", "teachers", "materials"],
  "notes": "School showing improvement in Science...",
  "status": "Saved"
}
```

### Auditor Activity Log
```json
{
  "auditorId": "AU00001",
  "action": "Viewed school report",
  "schoolId": "SCH7878",
  "page": "/auditor/schools/SCH7878/academic",
  "timestamp": "2026-04-28T10:45:00"
}
```

---

## 17. Development Phases

| Phase | What gets built | Status |
|-------|----------------|--------|
| 1 | Auditor CSS + Design System | ⏳ Pending |
| 2 | Auditor Login + Access Control | ⏳ Pending |
| 3 | Dashboard Overview + Health Map | ⏳ Pending |
| 4 | School Report — Academic Module | ⏳ Pending |
| 5 | School Report — Attendance Module | ⏳ Pending |
| 6 | School Report — Teacher Activity | ⏳ Pending |
| 7 | Comparative Analysis | ⏳ Pending |
| 8 | Audit Report Generator | ⏳ Pending |
| 9 | Auditor Notes + Saved Reports | ⏳ Pending |
| 10 | Polish — Print View, Responsive | ⏳ Pending |

---

## 🔗 Full System Architecture (All 3 Plans)

```
┌──────────────────────────────────────────────────────┐
│   PLAN 2 — Admin Dashboard                           │
│   Creates schools · Manages access · Assigns auditors│
└──────────────┬────────────────────────┬──────────────┘
               │ controls               │ assigns
               ▼                        ▼
┌─────────────────────┐    ┌──────────────────────────┐
│  PLAN 1             │    │  PLAN 3 — Auditor         │
│  School Web App     │    │  Observes school          │
│  Student / Teacher  │◄───│  performance (read-only)  │
│  HOD / Moderator    │    └──────────────────────────┘
└─────────────────────┘
```

---

*Document created: 2026-04-28 | Plan 3 · Version 1.0 | Status: Draft*
