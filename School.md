# 🏫 School Web App — Complete Planning Document

> **Purpose:** This document defines every feature, role, page, and data flow for the School Web App before a single line of code is written. Review and approve each section before development begins.

---

## 📌 Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Role Tree Model](#3-role-tree-model)
4. [Role Permissions Matrix](#4-role-permissions-matrix)
5. [Pages & Routes](#5-pages--routes)
6. [Role 1 — Student](#6-role-1--student)
7. [Role 2 — Teacher](#7-role-2--teacher)
8. [Role 3 — HOD / Principal](#8-role-3--hod--principal)
9. [Role 4 — Moderator](#9-role-4--moderator)
10. [Shared Systems](#10-shared-systems)
11. [Real-time Chat System](#11-real-time-chat-system)
12. [Paper, Quiz & Test Creation Module](#12-paper-quiz--test-creation-module)
13. [Real-time Chat System](#13-real-time-chat-system)
14. [UI/UX Design System](#14-uiux-design-system)
15. [File & Folder Structure](#15-file--folder-structure)
16. [Data Models (Supabase)](#16-data-models-supabase)
17. [Open Questions / To Confirm](#17-open-questions--to-confirm)

---

## 1. Project Overview

| Field         | Detail                                              |
|---------------|-----------------------------------------------------|
| **App Name**  | EduPortal *(can be changed)*                        |
| **Type**      | Multi-role School Management Web App                |
| **Frontend**  | HTML + CSS + Vanilla JavaScript                     |
| **Backend**   | Supabase (PostgreSQL, Realtime, Edge Functions) |
| **Auth**      | Supabase Authentication (Row-Level Security) |
| **Hosting**   | Local browser (can deploy to GitHub Pages later)    |
| **Language**  | English                                             |

---

## 2. Tech Stack

| Layer         | Technology               | Reason                                         |
|---------------|--------------------------|------------------------------------------------|
| Structure     | HTML5                    | Semantic, accessible markup                    |
| Styling       | Vanilla CSS              | Full control, no framework overhead            |
| Logic         | Vanilla JavaScript       | No build step, works in browser immediately    |
| Icons         | Lucide Icons (CDN)       | Free, crisp SVG icons                          |
| Fonts         | Google Fonts — *Inter*   | Modern, clean, readable                        |
| Charts        | Chart.js (CDN)           | Beautiful graphs for dashboards                |
| Storage       | Supabase (PostgreSQL)    | Secure, scalable, real-time sync               |

---

## 3. Role Tree Model

```
SCHOOL WEB APP
│
├── 👨‍🎓 Student          → Consumes content, tracks own progress
├── 👩‍🏫 Teacher          → Manages class, evaluates students
├── 🏛️  HOD / Principal   → Oversees entire school operations
└── 🛡️  Moderator         → Manages shared academic content for all
```

### Role Hierarchy (Access Level)

```
HOD/Principal  ──────  Highest authority
     │
  Moderator    ──────  Content authority (cross-department)
     │
  Teacher      ──────  Class-level authority
     │
  Student      ──────  View-only (own data)
```

---

## 4. Role Permissions Matrix

| Feature / Action                              | Student | Teacher         | Moderator | HOD/Principal |
|-----------------------------------------------|:-------:|:---------------:|:---------:|:-------------:|
| View announcements                            | ✅      | ✅              | ✅        | ✅            |
| Post announcements                            | ❌      | ❌ *(view only)*| ❌ *(view only)* | ✅ **only** |
| View own grades                               | ✅      | ❌              | ❌        | ✅ (all)      |
| View all students' grades (own subject only)  | ❌      | ✅ **own subject only** | ❌ | ✅ (all)  |
| Enter/edit grades (own subject only)          | ❌      | ✅ **own subject only** | ❌ | ✅ (all)  |
| View own attendance                           | ✅      | ❌              | ❌        | ✅ (all)      |
| Mark attendance *(mode-dependent)*            | ❌      | ✅ *(see §10.6)*| ❌        | ✅            |
| Submit assignments                            | ✅      | ❌              | ❌        | ❌            |
| Post assignments                              | ❌      | ✅ **only**     | ❌        | ❌            |
| View timetable                                | ✅      | ✅              | ✅        | ✅            |
| Edit timetable                                | ❌      | ❌              | ❌        | ✅            |
| Upload textbooks / study material             | ❌      | ❌              | ✅        | ✅            |
| Update syllabus / portions                    | ❌      | ❌              | ✅        | ✅            |
| View uploaded material                        | ✅      | ✅              | ✅        | ✅            |
| Manage teacher accounts                       | ❌      | ❌              | ❌        | ✅            |
| Configure school settings (attendance mode)   | ❌      | ❌              | ❌        | ✅            |
| View school-wide reports                      | ❌      | ❌              | ❌        | ✅            |
| View department-wise reports                  | ❌      | ✅              | ❌        | ✅            |
| Send messages (internal)                      | ✅      | ✅              | ✅        | ✅            |
| Use AI Tools *(if enabled by school)*         | ❌      | ✅              | ❌        | ✅ (manage)  |
| Create quiz / test / exam (manual)            | ❌      | ✅ **only**     | ❌        | ❌            |
| View created papers/quizzes                   | ❌      | ✅ (own)        | ❌        | ✅ (all)      |

---

## 5. Pages & Routes

| Page File          | Route / Purpose                              |
|--------------------|----------------------------------------------|
| `index.html`       | Landing + Role Selection + Login             |
| `student.html`     | Student Dashboard                            |
| `teacher.html`     | Teacher Dashboard                            |
| `hod.html`         | HOD / Principal Dashboard                    |
| `moderator.html`   | Moderator Dashboard                          |

> All pages share `style.css` (global) and `app.js` (shared utilities + Supabase client).

---

## 6. Role 1 — Student

### 6.1 Login
- Students have a **unique, separate login portal** from staff.
- Enter **11-digit Student Code** (e.g., `78782609341`) + **Password**.
- Redirects to Student Dashboard.

### 6.2 Dashboard Sections

#### 📊 Overview Cards (top row)
| Card | Data Shown |
|------|-----------|
| Attendance % | e.g., 87% present |
| Pending Assignments | e.g., 3 due |
| Average Grade | e.g., B+ |
| Next Class | e.g., Math at 10:00 AM |

#### 📅 Timetable
- Weekly view (Mon–Sat)
- Subject, Teacher Name, Room, Time
- Today's classes highlighted

#### 📝 Assignments
- List of assignments posted by teachers
- Subject, title, due date, status (Pending / Submitted)
- "Submit" button → marks as submitted (updates DB status)

#### 📈 Holistic Progress Card (HPC) — NEP 2020
- **Academic:** Subject | Formative | Summative | CBSE Grade (A1-E2) | Remarks
- **Socio-Emotional & Physical:** Teamwork, Leadership, Arts, Sports
- **Assessments:** Includes Self-Assessment and Peer Assessment inputs
- CGPA display for Secondary Stage (Class 9-12)

#### 📆 Attendance
- Monthly calendar view
- Present (green) / Absent (red) / Holiday (grey)
- % summary at top

#### 📚 Study Materials
- Materials uploaded by **Moderator**
- Filterable by Subject / Class / Type (Textbook / Notes / Portions)
- Download/View button

#### 📢 Announcements
- School-wide + class-specific announcements
- Posted by Teacher, Moderator, or HOD
- Date, author, priority badge (Normal / Urgent)

---

## 7. Role 2 — Teacher

### 7.1 Login
- Enter Name + Subject(s) + **NEP Stage** + Employee ID

### 7.2 Dashboard Sections

#### 📊 Overview Cards
| Card | Data |
|------|------|
| Total Students | e.g., 42 |
| Classes Today | e.g., 4 |
| Pending Grading | e.g., 8 submissions |
| Announcements Posted | e.g., 2 |

#### 👥 My Class — Student List
- Table: Roll No | Student Name | Attendance % | Avg Grade | Status
- Click student → view individual profile

#### ✅ Attendance Manager
- Select date + class
- Mark each student: Present / Absent / Late
- Submit → saves to Supabase `attendance` table

#### 📝 Assignments Manager
- Post new assignment: Title, Subject, Description, Due Date, Class
- View existing: Title | Class | Due Date | Submitted / Total
- View submitted students list

#### 📊 Grade Entry *(Own Subject Only)* — NEP Aligned
- Teacher sees **only their assigned subject**
- Tag assessment as **Formative** (ongoing) or **Summative** (exam)
- Enter marks per student for their subject
- **Auto-calculates CBSE Grade** (A1 to E2) based on marks
- **Foundational Stage toggle:** Enter Competency Levels (Beginning/Developing/Meeting) instead of marks
- Add qualitative remarks for the Holistic Progress Card

#### 📢 Announcements
- **View only** — Teacher cannot post announcements
- See all school-wide and class-specific announcements posted by HOD/Principal
- Filter by date, subject, priority

#### 📚 View Study Materials
- Same as student — can view Moderator-uploaded content
- Cannot upload (only Moderator can)

#### 📅 Timetable
- View own teaching schedule

#### 🎓 Professional Development (CPD)
- Log CPD hours (NEP mandate: 50 hours/year)
- Track progress towards annual goal

#### 🤖 AI Tools *(visible only if school has AI enabled)*
- See Section 11 for full detail
- Quick access: Generate Test | Explain Topic | Create Quiz

#### 📋 Paper / Quiz / Test Creator
- See Section 12 for full detail
- Create: Exam Paper | Quiz | Rapid Test (Manual or AI-assisted)
- View all created papers, share with class

---

## 8. Role 3 — HOD / Principal

### 8.1 Login
- Enter Name + Designation (HOD / Principal) + Department / School Code

### 8.2 Dashboard Sections

#### 📊 School Overview Cards
| Card | Data |
|------|------|
| Total Students | e.g., 450 |
| Total Teachers | e.g., 28 |
| Overall Attendance | e.g., 91% |
| Active Assignments | e.g., 15 |

#### 📈 Reports & Analytics
- **NEP Census Assessments:** Track performance in Grades 3, 5, and 8
- Bar chart: Average grades/CGPA per class
- Line chart: Attendance trend vs **75% CBSE threshold**
- Department-wise performance and HPC completion rate

#### 🏢 School Management Committee (SMC) & Evaluation
- Tools to communicate with SMC members (parents, community)
- Annual School Self-Evaluation tracking

#### 👩‍🏫 Teacher Management
- List all teachers: Name | Subject | Classes | Attendance Posted (last 7 days)
- Add new teacher (Supabase Auth invite/creation)
- View teacher's posted assignments & grades

#### 🎓 Student Overview
- Filter by Class / Department
- View individual student's grades + attendance
- Flag underperforming students (attendance < 75% OR grade < D)

#### 📢 Announcements
- Post school-wide announcements
- Mark as Urgent
- Target: All / Teachers only / Students only

#### 📅 Timetable Management
- View all class timetables
- Edit timetable slots

#### 📚 View Study Materials
- View everything uploaded by Moderator

---

## 9. Role 4 — Moderator

### 9.1 Who is the Moderator?
- A dedicated content manager (not a teacher, not admin)
- Manages **all shared academic content** accessible to everyone
- Examples: Librarian, Academic Coordinator, Curriculum Manager

### 9.2 Login
- Enter Name + Moderator ID

### 9.3 Dashboard Sections

#### 📊 Overview Cards
| Card | Data |
|------|------|
| Total Materials Uploaded | e.g., 64 |
| Subjects Covered | e.g., 12 |
| Last Upload | e.g., Today 9:30 AM |
| Pending Review | e.g., 3 |

#### 📚 Textbook Manager
- Upload textbook: Title, Subject, Class, Author, File (Supabase Storage link)
- View all textbooks in a card grid
- Edit / Delete textbook entry
- Filter by Subject / Class

#### 📋 Syllabus / Portions Manager
- Upload or paste portions for a Subject + Class
- Fields: Subject | Class | Chapter | Topics Covered | Exam Weightage
- View as structured table
- Update/Edit existing portions

#### 📄 Study Material Uploader
- Upload notes, PDFs, videos (Supabase Storage):
  - Title, Type (Notes / Video / Practice Paper / Reference)
  - Subject, Class, Description
- View all uploaded materials
- Edit / Delete entries

#### 📢 Post Announcements
- Post content-related announcements (e.g., "New Chapter 5 notes uploaded")
- Visible to all roles

#### 🗂️ Category & Tag Manager
- Create categories (e.g., Science, Maths, English)
- Tag materials by class, type, exam relevance

---

## 10. Shared Systems

### 10.1 Announcements Feed
- All roles can **view** announcements
- Filterable: All / School-wide / Class-specific / Content updates
- **Only HOD/Principal** can post announcements
- Each announcement has: Title | Body | Author | Role | Date | Priority

### 10.2 Study Materials Library
- Uploaded **only** by Moderator
- Accessible to: Student ✅ | Teacher ✅ | HOD ✅ | Moderator ✅
- Filter by: Subject | Class | Type | Date

### 10.6 Attendance Mode — School Setting *(New)*

> Configured by **HOD/Principal only** under School Settings.

| Mode | Name | How it works |
|------|------|--------------|
| **Mode A** | Morning Roll Call | Class teacher marks attendance **once per day** at morning assembly. One entry per student per day. |
| **Mode B** | Subject-wise Attendance | Every teacher marks attendance **at the start of their period**. Each subject has its own attendance record. Student can be present in Math but absent in Science. |

#### Mode A — Morning Roll Call
- Only the **assigned class teacher** can mark attendance for their class
- One toggle per student: Present / Absent / Late / Medical Leave
- Submitted grades locked after HOD approval
- HOD can override/edit if needed

#### Mode B — Subject-wise Attendance
- Every teacher marks attendance when their period begins
- Teacher sees only students of the class they teach at that period
- Each subject shows its own attendance % on student dashboard
- Overall attendance = average across all subjects
- HOD sees per-subject breakdown in reports

#### Where the Setting Lives
- HOD Dashboard → ⚙️ School Settings → Attendance Mode
- Toggle: `Morning Roll Call` ↔ `Subject-wise`
- Change takes effect from the next school day
- Setting is stored in Supabase `platform_settings` table (synced globally)

### 10.3 Internal Notifications
- Bell icon in navbar
- Shows recent activity (e.g., "New assignment posted by Math teacher")

### 10.4 Dark Mode
- Toggle button in every dashboard navbar
- Preference saved in user profile or LocalStorage

### 10.5 Responsive Design
- Works on Desktop, Tablet, and Mobile screens

---

## 11. AI Module *(Optional — School Setting)*

> **This entire module is optional.** HOD/Principal enables/disables it from School Settings.
> When disabled — AI buttons are completely hidden from all dashboards.

### 11.1 What Powers It?
- All **syllabus/portions** uploaded by Moderator
- All **study materials** (notes, textbooks, chapters) uploaded by Moderator
- AI reads these as context to generate content

### 11.2 Who Can Use AI Tools?
| Role | AI Access |
|------|----------|
| Student | ❌ No |
| Teacher | ✅ Yes — generate papers, quizzes, explanations |
| Moderator | ❌ No |
| HOD/Principal | ✅ Yes — enable/disable AI, view usage stats |

### 11.3 AI Features Available to Teacher

#### 📚 Topic Explainer
- Teacher selects: Subject → Chapter → Topic
- AI generates a structured explanation of the topic
- Output: Plain text explanation with examples
- Based on: Moderator-uploaded syllabus + notes for that topic
- Use case: Quick revision material, display on screen to class

#### 📝 Exam Paper Generator
- Teacher selects:
  - Subject
  - Class
  - Chapter(s) / Topic(s) *(multi-select from syllabus)*
  - Difficulty: Easy / Medium / Hard
  - Total Marks (e.g., 50, 100)
  - Question Types: MCQ / Short Answer / Long Answer / Mixed
- AI generates a full formatted exam paper
- Output: Printable exam paper with answer key
- Sections auto-divided (Section A, B, C)

#### ⚡ Rapid Test Generator
- Quick 10–15 question test
- Teacher selects: Subject + 1–2 Topics
- AI generates rapid test in under 10 seconds
- Question types: MCQ only (for fast marking)
- Output: Test sheet + answer key

#### 🌟 Quiz Generator (Interactive)
- Teacher selects: Subject + Topics + Number of Questions (5–20)
- AI generates a live quiz
- Students can take quiz in-browser (Realtime via Supabase)
- At end: Score shown, correct answers revealed
- Teacher can view class quiz scores

### 11.4 AI Settings (HOD/Principal — School Settings)
| Setting | Options |
|---------|---------|
| Enable AI Module | On / Off |
| AI Model | Gemini API (via Supabase Edge Function) |
| Allowed Features | All / Exam Paper only / Quiz only |
| Usage Log | View how many papers/quizzes generated |

### 11.5 Data Flow
```
Moderator uploads syllabus + materials
         ↓
   Stored in Supabase DB / Storage
         ↓
   Teacher opens AI Tools
         ↓
   Selects Subject + Topic(s)
         ↓
   AI reads matching syllabus/material content
         ↓
   Generates: Explanation / Exam Paper / Quiz / Rapid Test
         ↓
   Output displayed + downloadable as PDF
```

### 11.6 AI Backend (Edge Functions)
- AI calls will be routed through **Supabase Edge Functions** to securely manage API keys (e.g., Gemini API).
- Ensures students/teachers cannot expose keys via frontend JS.

---

## 12. Paper, Quiz & Test Creation Module

> **Core principle:** Manual creation always works. AI generation is an optional enhancement.
> Teacher always has full control — can create from scratch or let AI draft, then edit.

### 12.1 Creation Modes

| Mode | How it works | AI Required? |
|------|-------------|:------------:|
| **Manual** | Teacher builds paper question by question | ❌ No |
| **AI Draft + Edit** | AI generates draft → Teacher reviews & edits | ✅ Yes (if enabled) |

### 12.2 Paper Types

| Type | Description | Time Limit | Question Types |
|------|-------------|:----------:|----------------|
| **Exam Paper** | Full formal exam with sections | Optional | MCQ + Short + Long |
| **Rapid Test** | Quick classroom test | 10–30 min | MCQ only |
| **Quiz** | Interactive in-browser quiz | Optional | MCQ + True/False |
| **Practice Paper** | Homework / self-study | None | Any |

### 12.3 Manual Creation Flow (Step by Step)

```
Step 1: Teacher clicks "Create New"
         ↓
Step 2: Select Type → Exam Paper / Rapid Test / Quiz / Practice
         ↓
Step 3: Fill Header:
        - Title, Subject, Class, Date, Total Marks, Duration
         ↓
Step 4: Add Questions one by one:
        - Question text
        - Type: MCQ / Short Answer / Long Answer / True–False / Fill in the Blank
        - For MCQ: Add 4 options, mark correct answer
        - Marks for this question
        - Optional: Hint / Difficulty tag (Easy / Medium / Hard)
         ↓
Step 5: Reorder questions (up/down arrows)
         ↓
Step 6: Preview full paper
         ↓
Step 7: Save Draft → Publish → Print
```

### 12.4 AI-Assisted Creation Flow *(if AI enabled)*

```
Step 1: Teacher clicks "Create with AI"
         ↓
Step 2: Select:
        - Type (Exam Paper / Quiz / Rapid Test)
        - Subject, Class
        - Topics (multi-select from Moderator's syllabus)
        - Difficulty (Easy / Medium / Hard / Mixed)
        - Total Marks + Duration
        - Question Types (MCQ / Short / Long / Mixed)
         ↓
Step 3: AI generates a full draft paper
         ↓
Step 4: Teacher reviews in editor:
        - Edit any question text
        - Change marks per question
        - Delete / Add questions manually
        - Reorder questions
         ↓
Step 5: Preview full paper
         ↓
Step 6: Save Draft → Publish → Print
```

### 12.5 Question Types Supported

| Type | Format | Answer Field |
|------|--------|--------------|
| MCQ | Question + 4 options | Select one |
| True / False | Statement | True or False toggle |
| Short Answer | Question | 1–3 lines text |
| Long Answer / Essay | Question | Paragraph text |
| Fill in the Blank | Sentence with ___ | Type the word |

### 12.6 Quiz Mode (Interactive)
- When type = **Quiz**, students can take it **live in browser**
- Teacher shares a **Quiz Code** (e.g., 6-digit code)
- Students enter code on Student Dashboard → quiz begins
- Timer counts down on screen
- At end: Score shown instantly, correct answers revealed
- Teacher sees live scoreboard during quiz

### 12.7 Paper Lifecycle

| Status | Meaning |
|--------|---------|
| **Draft** | Being built — not visible to students |
| **Published** | Visible to target class, ready to attempt |
| **Active** | Live — being taken right now (Quiz mode) |
| **Closed** | Submissions locked, marking begins |
| **Archived** | Saved for future reference / reuse |

### 12.8 Paper Management (Teacher Dashboard)
- List: Title | Type | Subject | Class | Status | Created Date
- Actions: **Edit** (Draft only) | **Preview** | **Publish** | **Duplicate** | **Delete** | **Print**
- View submissions + auto-mark (MCQ / T-F)
- Export marks → feeds directly into Grade Entry

### 12.9 Print / Export
- **Print View**: Clean printable format (no sidebar, no UI chrome)
- **Two versions**:
  - 🧑‍🎓 Student Copy — questions only, no answers
  - 👩‍🏫 Teacher Copy — questions + answer key + marks
- Browser `window.print()` triggered

---

## 11. UI/UX Design System

### Color Palette
| Token            | Color                  | Usage                        |
|------------------|------------------------|------------------------------|
| `--primary`      | `#6C63FF` (Indigo)     | Buttons, active states       |
| `--secondary`    | `#F59E0B` (Amber)      | Badges, highlights           |
| `--danger`       | `#EF4444` (Red)        | Alerts, low attendance       |
| `--success`      | `#10B981` (Green)      | Present, submitted           |
| `--bg-dark`      | `#0F172A` (Slate 900)  | Dark background              |
| `--card-dark`    | `#1E293B` (Slate 800)  | Card backgrounds             |
| `--text-primary` | `#F1F5F9`              | Main text (dark mode)        |
| `--text-muted`   | `#94A3B8`              | Subtext, labels              |
| `--border`       | `#334155`              | Card borders                 |

### Typography
- **Font**: Inter (Google Fonts)
- **Sizes**: `12px` (caption) → `14px` (body) → `18px` (heading) → `28px` (page title)
- **Weight**: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)

### Components
| Component      | Used In                           |
|----------------|-----------------------------------|
| Stat Card      | All dashboards (overview row)     |
| Data Table     | Students, grades, materials       |
| Sidebar Nav    | All dashboard pages               |
| Top Navbar     | Search + Bell + Avatar + Logout   |
| Modal / Drawer | Add/Edit forms                    |
| Badge          | Status (Pending/Submitted/Urgent) |
| Chart          | HOD analytics, student grades     |
| Calendar       | Student attendance view           |
| Card Grid      | Study materials library           |
| Toast Alert    | Action feedback (saved/deleted)   |

### Animations
- Sidebar items: slide-in on load
- Cards: fade-up on page load
- Buttons: hover lift + glow
- Modal: scale-in animation
- Toast: slide-in from top-right

---

## 13. Real-time Chat System

A global floating chat drawer (💬) is available on all Plan 1 dashboards (Student, Teacher, HOD, Moderator).

*   **Students:** Can only participate in Classroom Chats (created by Teachers) and School Chats (created by HOD/Moderator). They can never create chats.
*   **Teachers:** Can create Classroom Chats for their assigned subjects.
*   **HOD/Moderator:** Can create School-wide Chats.

> **See `Chat_System.md` for full implementation details, Supabase schemas, and cross-layer chat rules.**

---

## 14. UI/UX Design System

```
SCHOOL/
│
├── index.html           ← Landing page + Role Login
├── student.html         ← Student Dashboard
├── teacher.html         ← Teacher Dashboard
├── hod.html             ← HOD/Principal Dashboard
├── moderator.html       ← Moderator Dashboard
│
├── style.css            ← Global styles (design system)
├── app.js               ← Shared utilities + Supabase client
│
├── student.js           ← Student-specific logic
├── teacher.js           ← Teacher-specific logic
├── hod.js               ← HOD-specific logic
├── moderator.js         ← Moderator-specific logic
├── ai.js                ← AI module logic (calls Edge Functions)
│
└── SCHOOL_APP_PLAN.md   ← This document
```

---

## 15. File & Folder Structure

## 16. Data Models (Supabase)
```json
{
  "id": "78782609341",
  "name": "Arjun Sharma",
  "class": "10-A",
  "rollNo": 12,
  "attendance": 87,
  "grades": [
    { "subject": "Math", "marks": 85, "max": 100, "grade": "A" },
    { "subject": "Science", "marks": 72, "max": 100, "grade": "B+" }
  ],
  "assignments": [
    { "id": "A001", "title": "Algebra Homework", "due": "2026-04-30", "status": "Pending" }
  ]
}
```

### Teacher
```json
{
  "id": "T000001",
  "name": "Mrs. Priya Nair",
  "subject": "Mathematics",
  "classes": ["10-A", "10-B", "9-A"],
  "employeeId": "T000001"
}
```

### Study Material (by Moderator)
```json
{
  "id": "MAT001",
  "title": "Chapter 5 — Quadratic Equations",
  "type": "Notes",
  "subject": "Mathematics",
  "class": "10",
  "uploadedBy": "Moderator",
  "uploadedAt": "2026-04-28",
  "fileLink": "#"
}
```

### Announcement
```json
{
  "id": "ANN001",
  "title": "Mid-term Exam Schedule Released",
  "body": "Mid-term exams will be held from May 10–15.",
  "author": "Principal",
  "role": "HOD/Principal",
  "date": "2026-04-28",
  "priority": "Urgent",
  "target": "All"
}
```

### Syllabus / Portions
```json
{
  "id": "SYL001",
  "subject": "Physics",
  "class": "11",
  "chapter": "Chapter 3",
  "topics": ["Laws of Motion", "Newton's Laws", "Friction"],
  "examWeightage": "15%",
  "updatedAt": "2026-04-27"
}
```

### AI Generated Paper *(Supabase output record)*
```json
{
  "id": "TEST0000011234",
  "generatedBy": "T000001",
  "subject": "Physics",
  "class": "11",
  "topics": ["Laws of Motion", "Friction"],
  "type": "Exam Paper",
  "difficulty": "Medium",
  "totalMarks": 50,
  "questionCount": 20,
  "generatedAt": "2026-04-28T10:30:00",
  "content": "...generated paper content..."
}
```

### AI Settings (School)
```json
{
  "aiEnabled": true,
  "aiModel": "gemini",
  "allowedFeatures": ["examPaper", "quiz", "rapidTest", "explainer"],
  "usageCount": 42
}
```

---

## 17. Open Questions / To Confirm

> Please review these before I start coding:

- [ ] **App Name** — Should it be `EduPortal` or a custom name for your school?
- [ ] **School Name** — Any specific school name to display?
- [ ] **Classes** — What classes exist? (e.g., Class 1–12? Or only 9–12?)
- [ ] **Subjects** — Any specific subjects list? (e.g., Math, Science, English, History…)
- [ ] **Color Scheme** — Happy with Indigo + Amber on Dark? Or preferred school colors?
- [ ] **Language** — English only, or bilingual?
- [ ] **Supabase Setup** — Have you created the Supabase project, or should I start with mock JS first until we are ready?
- [ ] **Moderator Access** — Can Moderator view grades & attendance, or only manage materials?
- [ ] **HOD vs Principal** — Are these the same login, or separate roles with different access?

---

## ✅ Development Phases

| Phase | What gets built                                          | Status       |
|-------|----------------------------------------------------------|--------------|
| 1     | Global CSS + Design System                               | ⏳ Pending   |
| 2     | Landing Page + Role Login                                | ⏳ Pending   |
| 3     | Student Dashboard (all sections)                         | ⏳ Pending   |
| 4     | Teacher Dashboard (all sections)                         | ⏳ Pending   |
| 5     | Moderator Dashboard (all sections)                       | ⏳ Pending   |
| 6     | HOD/Principal Dashboard + School Settings                | ⏳ Pending   |
| 7     | Shared Systems (Announcements, Materials)                | ⏳ Pending   |
| 8     | Paper/Quiz/Test Creator — Manual                         | ⏳ Pending   |
| 9     | AI Module (Exam, Quiz, Rapid Test, Explainer)            | ⏳ Pending   |
| 10    | Polish — Animations, Dark Mode, Mobile                   | ⏳ Pending   |

---

*Document created: 2026-04-28 | Version: 1.0 | Status: Awaiting Review*
