# 🇮🇳 NEP 2020 — How It Applies to Our School Web App
## NEP_Alignment.md

> **Source:** National Education Policy 2020 — Ministry of Education, Government of India
> **PDF:** https://www.education.gov.in/sites/upload_files/mhrd/files/NEP_Final_English_0.pdf
> **Purpose:** This document extracts every relevant point from NEP 2020 and maps it
> directly to features we need to build in Plan 1 (School App), Plan 2 (Admin), and Plan 3 (Auditor).

---

## 📌 Table of Contents

1. [NEP 2020 — School Structure (5+3+3+4)](#1-nep-2020--school-structure)
2. [Stage-wise Subjects](#2-stage-wise-subjects)
3. [Assessment System — Holistic Progress Card](#3-assessment-system)
4. [Attendance Rules](#4-attendance-rules)
5. [Teacher Role under NEP](#5-teacher-role-under-nep)
6. [Principal / HOD Role under NEP](#6-principal--hod-role-under-nep)
7. [Grading Scale](#7-grading-scale)
8. [NEP → App Feature Mapping](#8-nep--app-feature-mapping)
9. [What Changes in Our Plans](#9-what-changes-in-our-plans)

---

## 1. NEP 2020 — School Structure

NEP 2020 **replaces the old 10+2 system** with a new **5+3+3+4 structure** aligned to child development stages.

```
OLD SYSTEM (10+2)           NEW NEP 2020 SYSTEM (5+3+3+4)
─────────────────           ──────────────────────────────
Class 1–5  (Primary)        Foundational Stage   (Age 3–8)
Class 6–8  (Middle)         Preparatory Stage    (Age 8–11)
Class 9–10 (Secondary)      Middle Stage         (Age 11–14)
Class 11–12 (Sr. Secondary) Secondary Stage      (Age 14–18)
```

### Stage Breakdown

| Stage | Age | Classes | Duration | Focus |
|-------|:---:|:-------:|:--------:|-------|
| **Foundational** | 3–8 | Pre-K + Class 1–2 | 5 years | Play-based, activity-based, mother tongue |
| **Preparatory** | 8–11 | Class 3–5 | 3 years | Formal learning, core concepts, experiential |
| **Middle** | 11–14 | Class 6–8 | 3 years | Subject-based, vocational exposure, coding |
| **Secondary** | 14–18 | Class 9–12 | 4 years | Multidisciplinary, critical thinking, flexibility |

> **For our app:** Schools select their stage when registering. The app adjusts available subjects, grading methods, and assessment types accordingly.

---

## 2. Stage-wise Subjects

### 2.1 Foundational Stage (Class 1–2 + Pre-K)
| Subject Area | Examples |
|-------------|---------|
| Languages | Mother tongue / Regional language + Hindi/English |
| Numeracy | Basic numbers, shapes, counting |
| Environmental Studies | Nature, family, community |
| Arts & Crafts | Drawing, clay, music |
| Physical Education | Games, motor skills |
| Socio-emotional | Values, stories, activities |

> Assessment: **Qualitative only** — NO marks/grades. Descriptive teacher observations.

---

### 2.2 Preparatory Stage (Class 3–5)
| Subject | Notes |
|---------|-------|
| Mathematics | Core concepts, problem solving |
| Environmental Studies | Science + Social Studies integrated |
| Languages (2) | Mother tongue + Hindi or English |
| Arts | Integrated, not extra-curricular |
| Physical Education | Regular, graded |
| Vocational Exploration | Crafts, pottery, local trades (introductory) |

> Assessment: **Formative + some summative.** Descriptive + basic marks. Census assessments at Grade 3 and 5.

---

### 2.3 Middle Stage (Class 6–8)
| Subject | Notes |
|---------|-------|
| Mathematics | Algebra, geometry, data |
| Science | Physics, Chemistry, Biology (integrated) |
| Social Science | History, Geography, Civics, Economics |
| Languages (3) | Mother tongue + Hindi + English (3-language formula) |
| Arts Education | Visual arts, performing arts, music |
| Physical Education & Well-being | Sports, yoga, health |
| Vocational Education | Coding, carpentry, local vocations |
| General Knowledge / Values | Ethics, Indian knowledge systems |

> Assessment: **Formative + Summative.** Marks + competency-based. Census assessment at Grade 8.

---

### 2.4 Secondary Stage (Class 9–12)

#### Phase 1: Class 9–10
| Subject | Notes |
|---------|-------|
| Core Languages (2 min.) | Hindi / English + regional |
| Mathematics & Computing | Includes coding/data science |
| Science (PCB/PCM or combinations) | Flexible — not locked to streams |
| Social Sciences | History, Political Science, Economics, Geography |
| Arts | Mandatory — at least one arts subject |
| Physical Education | Mandatory |
| Vocational Subject | At least one from vocational catalogue |

#### Phase 2: Class 11–12 (Multidisciplinary — no rigid streams)
- **No compulsory Arts/Science/Commerce separation**
- Students can mix: Physics + History + Music is valid
- Minimum 5 subjects per semester
- At least 1 language, 1 maths/science, 1 social science/humanity, 1 arts/vocational

> Assessment: **Board examinations (Grade 10 + Grade 12)** continue, but reformed to be competency-based, not rote-learning based.

---

## 3. Assessment System

### 3.1 Holistic Progress Card (HPC) — NEP's New Report Card

NEP 2020 replaces the traditional marks-only report card with a **360-degree Holistic Progress Card** covering:

| Domain | What is assessed |
|--------|-----------------|
| **Academic / Cognitive** | Subject knowledge, conceptual clarity, analytical ability |
| **Socio-Emotional** | Teamwork, empathy, leadership, communication |
| **Physical / Health** | Sports participation, fitness, well-being |
| **Artistic / Creative** | Arts, music, creativity |
| **Vocational** | Practical skills, project work |

### 3.2 Assessment Types

| Type | Description | Who does it |
|------|-------------|-------------|
| **Teacher Assessment** | Ongoing observation, classwork, projects | Teacher |
| **Self-Assessment** | Student reflects on their own learning | Student |
| **Peer Assessment** | Students give feedback to each other | Student |
| **Standardized Test** | Census-level (Grades 3, 5, 8) | External board |
| **Board Exam** | Class 10 and Class 12 | Board (CBSE/State) |

### 3.3 Assessment Philosophy
- **Formative (ongoing)** > **Summative (one exam)**
- Tests should test **understanding and application**, not memory
- Multiple low-stakes tests better than one high-stakes exam
- Short tests, quizzes, rapid tests → **very aligned with our Paper Creator!**

### 3.4 Grading

NEP 2020 recommends **competency-based grading** over raw marks. CBSE uses:

| Grade | Marks Range | Meaning |
|-------|:-----------:|---------|
| **A1** | 91–100 | Outstanding |
| **A2** | 81–90 | Excellent |
| **B1** | 71–80 | Very Good |
| **B2** | 61–70 | Good |
| **C1** | 51–60 | Satisfactory |
| **C2** | 41–50 | Average |
| **D** | 33–40 | Below Average (Pass) |
| **E** | Below 33 | Needs Improvement (Fail) |

> **For our app:** Grade entry by teacher → auto-calculate grade letter using this CBSE scale.

### 3.5 Competency Levels (Alternative to marks — Foundational stage)
| Level | Description |
|-------|-------------|
| **Beginning** | Not yet meeting expectations |
| **Developing** | Partially meeting expectations |
| **Meeting** | Fully meeting expectations |
| **Exceeding** | Going beyond expectations |

> Used for Class 1–2 (Foundational stage) instead of marks.

---

## 4. Attendance Rules

NEP 2020 does not mandate a specific attendance percentage at the policy level — this is set by:
- **CBSE:** Minimum **75% attendance** required for board exam eligibility (Classes 9–12)
- **State Boards:** Usually 75–85% depending on state
- **School-level policy:** School can set stricter rules

### 4.1 NEP Philosophy on Attendance
- Attendance tracking is important for **identifying at-risk students early**
- Chronic absenteeism (missing > 25% of days) is a dropout risk indicator
- Schools must have a **re-engagement protocol** for frequently absent students

### 4.2 Working Days (Standard)
| Level | Min Working Days/Year |
|-------|:--------------------:|
| Class 1–5 | 200 days |
| Class 6–8 | 220 days |
| Class 9–12 | 220 days |

### 4.3 For Our App
- Default attendance threshold: **75%** (configurable by HOD)
- Students below 75% → flagged in red on dashboard
- Students 75–85% → flagged in amber (warning)
- Two attendance modes already planned (Morning / Subject-wise) ✅

---

## 5. Teacher Role Under NEP

### 5.1 Core Role Shift
| Old Role | New NEP Role |
|----------|-------------|
| Instructor (lectures, dictates) | **Facilitator** (guides, questions, enables) |
| Marks-focused | **Competency-focused** |
| One-size-fits-all | **Differentiated learning** |
| Textbook-only | **Multi-source, activity-based** |

### 5.2 Teacher Responsibilities
- Design **competency-based lesson plans**
- Conduct **regular formative assessments** (quizzes, rapid tests, projects)
- Maintain **Holistic Progress Card** entries
- Track **attendance and flag at-risk students**
- Participate in **50 hours of CPD (Continuous Professional Development) per year**
- Collaborate with other teachers on **cross-subject projects**

### 5.3 Subject Ownership
- Each teacher is **assigned specific subjects** for specific classes
- Teacher responsible for: marks entry, attendance (if Mode B), assignments, materials
- **Cannot view/edit other teachers' subject marks** ✅ (already in our plan)

### 5.4 For Our App — Teacher Dashboard Additions
- **CPD Tracker**: Log professional development hours (50/year)
- **Competency-based grading option** alongside marks
- **Self-assessment & peer assessment submission tracking** for student HPC
- Support for **project/portfolio-based assessment** entries (not just exam marks)

---

## 6. Principal / HOD Role Under NEP

### 6.1 Principal — Visionary Leader (not just admin)
NEP 2020 explicitly repositions the Principal as:

| Old Role | New NEP Role |
|----------|-------------|
| Administrative head | **Instructional / Academic Leader** |
| Manager | **Mentor of teachers** |
| Rule enforcer | **Culture architect** |

### 6.2 Principal Responsibilities
- Facilitate teacher **CPD (50 hours/year)**
- Ensure school culture aligns with NEP values (inclusive, caring, curious)
- Manage **School Management Committee (SMC)** — includes teachers, parents, community
- Oversee curriculum delivery across all stages
- Ensure **no student is denied education** due to socioeconomic factors
- Lead **annual school self-evaluation**

### 6.3 HOD (Head of Department)
Under NEP's subject-oriented middle + secondary stage:
- Each department (Science, Math, Languages, Arts, Vocational) has an **HOD**
- HOD monitors subject teachers, ensures syllabus coverage, reviews performance

### 6.4 School Management Committee (SMC)
NEP 2020 mandates SMC:
| Member | Role |
|--------|------|
| Principal | Chairperson |
| Teachers (elected) | Academic representatives |
| Parents | Community voice |
| Community leaders | Local accountability |

> **For our app:** HOD dashboard should include SMC tools — parent communication, community reports.

### 6.5 Annual School Self-Evaluation (ASER-style)
- Principal leads an annual review of school performance
- Areas: Academic outcomes, attendance, teacher quality, infrastructure
- Results shared with education board

> **Mapped to:** HOD Dashboard → Reports & Analytics ✅

---

## 7. Grading Scale

### 7.1 CBSE Grading (Class 9–12 — most common)

| Grade | Marks | Grade Point | Descriptor |
|-------|:-----:|:-----------:|------------|
| A1 | 91–100 | 10 | Outstanding |
| A2 | 81–90 | 9 | Excellent |
| B1 | 71–80 | 8 | Very Good |
| B2 | 61–70 | 7 | Good |
| C1 | 51–60 | 6 | Satisfactory |
| C2 | 41–50 | 5 | Average |
| D | 33–40 | 4 | Needs Improvement |
| E1 | 21–32 | — | Fail |
| E2 | 0–20 | — | Fail |

### 7.2 CGPA Calculation
```
CGPA = Sum of Grade Points (best 5 subjects) / 5
```
- Displayed on report card
- Used for Class 10 board results

### 7.3 Holistic Progress Card Components (Weightage — suggestive)

| Component | Weightage |
|-----------|:---------:|
| Academic Marks (Subject exams) | 40% |
| Formative Assessment (tests, quizzes, projects) | 30% |
| Co-scholastic (Arts, Sports, Values) | 20% |
| Self / Peer Assessment | 10% |

### 7.4 For Foundational Stage (Class 1–2)
No marks. Use competency levels:
- 🟢 Exceeding | 🔵 Meeting | 🟡 Developing | 🔴 Beginning

---

## 8. NEP → App Feature Mapping

### Plan 1 (School App) Feature Updates Required

| NEP Requirement | Feature to Build / Update |
|----------------|--------------------------|
| 5+3+3+4 stage structure | School setup: select stage (Foundational/Preparatory/Middle/Secondary) |
| Holistic Progress Card | Student report card → add Socio-Emotional, Arts, Sports, Peer Assessment sections |
| Competency-based grading (Class 1–2) | Grade entry → toggle: Marks mode OR Competency level mode |
| CBSE grade scale (A1–E2) | Auto-calculate grade from marks using CBSE table |
| CGPA calculation | Show CGPA on student report card (best 5 subjects) |
| Formative + Summative split | Grade entry: tag assessment as Formative or Summative |
| 75% attendance threshold | Default threshold set to 75%, flag students below it |
| Teacher CPD 50 hrs/year | Teacher dashboard → CPD tracker section |
| 3-language formula | Subject setup: include Languages (L1 / L2 / L3) |
| No stream separation (Cl. 11–12) | Subject selection: flexible, not locked to Science/Arts/Commerce |
| SMC tools for Principal | HOD dashboard → SMC / Parent communication section |
| Self-assessment by student | Student dashboard → Self-assessment submission per subject |
| Peer assessment | Student dashboard → Peer review section (per assignment) |
| Census assessment tracking (Gr. 3, 5, 8) | HOD → Reports → Census exam results section |

---

### Plan 3 (Auditor) Feature Updates Required

| NEP Requirement | Auditor Feature |
|----------------|----------------|
| Annual school self-evaluation | Auditor sees school's self-evaluation report |
| Stage-wise performance benchmarks | Compare school's grades vs national/state benchmarks |
| Attendance (75% rule) | Flag students/classes below 75% threshold |
| Teacher CPD compliance | Auditor sees teacher CPD hours logged |
| HPC coverage | % of students with complete HPC filled |
| Subject coverage (syllabus %) | How much of NEP-mandated syllabus is covered |

---

## 9. What Changes in Our Plans

### ✅ Already Correct (no change needed)
- Role structure: Student, Teacher, HOD, Moderator ✅
- Teacher scoped to own subject for grades ✅
- HOD can view all ✅
- Attendance modes (Morning / Subject-wise) ✅
- Materials library for moderator ✅
- Paper creator (formative assessment tools) ✅

### 🔄 Updates Required to School.md

| Section | Update |
|---------|--------|
| **Student Registration** | Add: Stage (Foundational/Preparatory/Middle/Secondary) + Class |
| **Grade Entry** | Add: Formative vs Summative tag; CBSE grade auto-calc; Competency level mode for Class 1–2 |
| **Student Report Card** | Add: HPC sections (Academic + Socio-Emotional + Arts/Sports + Self/Peer) |
| **Teacher Dashboard** | Add: CPD Hours Tracker (50 hrs/year goal) |
| **Subjects list** | Must include all NEP-mandated subjects per stage |
| **CGPA** | Show CGPA for Class 9–12 students |
| **HOD Dashboard** | Add: SMC tools; Annual self-evaluation; Census assessment results |
| **Attendance flags** | Default threshold = 75% (CBSE standard) |

### 🔄 Updates Required to Auditor.md

| Section | Update |
|---------|--------|
| **Academic Module** | Add: HPC completion rate; CGPA distribution; Formative vs Summative split |
| **Teacher Module** | Add: CPD hours logged per teacher |
| **School Health** | Add: NEP compliance score (% of NEP features being used) |
| **Benchmarks** | Add: 75% attendance benchmark line on all attendance charts |

---

## 📚 Key NEP 2020 Terms — Glossary

| Term | Full Form / Meaning |
|------|-------------------|
| **NEP** | National Education Policy 2020 |
| **HPC** | Holistic Progress Card — 360° student assessment |
| **FLN** | Foundational Literacy and Numeracy |
| **CPD** | Continuous Professional Development (50 hrs/year for teachers) |
| **CGPA** | Cumulative Grade Point Average |
| **SMC** | School Management Committee |
| **CBSE** | Central Board of Secondary Education |
| **Formative** | Ongoing, low-stakes assessment (quizzes, projects, rapid tests) |
| **Summative** | End-of-term, high-stakes assessment (board exams) |
| **5+3+3+4** | New school structure: Foundational + Preparatory + Middle + Secondary |
| **DIKSHA** | National digital platform for teachers (Government of India) |
| **ASER** | Annual Status of Education Report — benchmarking tool |

---

*Document created: 2026-04-28 | Based on NEP 2020 (Ministry of Education, GoI)*
*Reference: https://www.education.gov.in/sites/upload_files/mhrd/files/NEP_Final_English_0.pdf*
