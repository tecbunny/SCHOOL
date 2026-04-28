# 🌐 EduPortal — Super Admin Platform Management Dashboard
## Plan 2 · Admin.md

> **What is Plan 2?**
> A separate web application used by the **platform owner** (you) to manage all schools
> that are registered on the EduPortal service. Think of it as the "control tower"
> above all school instances (Plan 1).

---

## 📌 Table of Contents

1. [System Architecture — Plan 1 vs Plan 2](#1-system-architecture)
2. [Who Uses Admin Dashboard](#2-who-uses-admin-dashboard)
3. [Admin Roles](#3-admin-roles)
4. [Pages & Routes](#4-pages--routes)
5. [School Lifecycle](#5-school-lifecycle)
6. [Dashboard — Overview](#6-dashboard--overview)
7. [School Management](#7-school-management)
8. [School Registration & Onboarding](#8-school-registration--onboarding)
9. [Feature Control Per School](#9-feature-control-per-school)
10. [Subscription & Plan Management](#10-subscription--plan-management)
11. [Analytics & Reports](#11-analytics--reports)
12. [Admin User Management](#12-admin-user-management)
13. [Notifications & Alerts](#13-notifications--alerts)
14. [UI/UX Design System](#14-uiux-design-system)
15. [File & Folder Structure](#15-file--folder-structure)
16. [Data Models](#16-data-models)
17. [Integration with Plan 1](#17-integration-with-plan-1)
18. [Development Phases](#18-development-phases)

---

## 1. System Architecture

```
┌─────────────────────────────────────────────────────────┐
│              PLAN 2 — ADMIN PLATFORM DASHBOARD          │
│                  (Platform Owner Only)                  │
│                                                         │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │ Super Admin │  │  Admin Team  │  │  Support Staff│  │
│  └──────┬──────┘  └──────┬───────┘  └───────┬───────┘  │
│         └────────────────┼──────────────────┘          │
│                          ▼                             │
│              ┌───────────────────────┐                 │
│              │  School Registry DB   │                 │
│              └───────────┬───────────┘                 │
└──────────────────────────┼──────────────────────────── ┘
                           │  manages
        ┌──────────────────┼──────────────────┐
        ▼                  ▼                  ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  School A    │  │  School B    │  │  School C    │
│  (Plan 1)    │  │  (Plan 1)    │  │  (Plan 1)    │
│  Active ✅   │  │  Trial ⏳    │  │  Suspended ❌ │
└──────────────┘  └──────────────┘  └──────────────┘
```

### Key Separation
| | Plan 1 (School App) | Plan 2 (Admin Dashboard) |
|-|---------------------|--------------------------|
| **Users** | Students, Teachers, HOD, Moderator | Super Admin, Admin Team |
| **Scope** | One school's operations | All schools on the platform |
| **URL** | `school.eduportal.com/[schoolcode]` | `admin.eduportal.com` |
| **Data** | School-specific data | Platform-wide registry |
| **Access** | School staff only | Platform owner only |

---

## 2. Who Uses Admin Dashboard

| Person | Role | What they do |
|--------|------|-------------|
| **You (Owner)** | Super Admin | Full access — all actions |
| **Team Member** | Admin | Manage schools, handle requests |
| **Support Staff** | Support | View school info, resolve issues |

---

## 3. Admin Roles

### 3.1 Super Admin
- Full platform control
- Create / remove admin accounts
- Access all schools' data
- Manage billing & subscriptions
- Enable/disable platform features globally
- View all analytics

### 3.2 Admin
- Create / edit / suspend schools
- Approve school registration requests
- Enable/disable features per school
- View school analytics
- Cannot: delete super admin, change billing

### 3.3 Support
- View school details (read only)
- View school usage stats
- Cannot: create/delete/suspend schools

### Role Permissions Matrix

| Action | Super Admin | Admin | Support |
|--------|:-----------:|:-----:|:-------:|
| View all schools | ✅ | ✅ | ✅ |
| Create new school | ✅ | ✅ | ❌ |
| Edit school info | ✅ | ✅ | ❌ |
| Suspend school | ✅ | ✅ | ❌ |
| Delete school | ✅ | ❌ | ❌ |
| Approve registration | ✅ | ✅ | ❌ |
| Enable/disable features | ✅ | ✅ | ❌ |
| Manage subscriptions | ✅ | ❌ | ❌ |
| View analytics | ✅ | ✅ | ✅ |
| Manage admin accounts | ✅ | ❌ | ❌ |
| Send platform announcements | ✅ | ✅ | ❌ |

---

## 4. Pages & Routes

| Page | Route | Purpose |
|------|-------|---------|
| Login | `/login` | Admin login |
| Dashboard | `/` | Platform overview |
| Schools List | `/schools` | All registered schools |
| School Detail | `/schools/[id]` | Single school management |
| Add School | `/schools/new` | Manually create school |
| Registrations | `/registrations` | Pending school requests |
| Subscriptions | `/subscriptions` | Plans & billing |
| Analytics | `/analytics` | Platform-wide stats |
| Admin Users | `/admins` | Manage admin accounts |
| Settings | `/settings` | Platform settings |
| Notifications | `/notifications` | Alerts & activity log |

---

## 5. School Lifecycle

```
School submits registration request
              ↓
     [PENDING] — Waiting for admin review
              ↓
    Admin reviews request
       ↙           ↘
 [REJECTED]      [APPROVED]
                     ↓
              [TRIAL] — 30-day free trial
                     ↓
          Trial expires or school upgrades
              ↙              ↘
        [EXPIRED]          [ACTIVE] — Paid subscription
                               ↓
                    Admin can change status:
                    ↙         ↓         ↘
              [SUSPENDED]  [ACTIVE]  [DELETED]
```

### Status Definitions

| Status | Badge Color | Meaning |
|--------|:-----------:|---------|
| **Pending** | 🟡 Yellow | Registration submitted, awaiting review |
| **Trial** | 🔵 Blue | Approved, on 30-day free trial |
| **Active** | 🟢 Green | Paid subscription, full access |
| **Suspended** | 🟠 Orange | Temporarily blocked (non-payment / violation) |
| **Expired** | ⚫ Grey | Trial/plan ended, no renewal |
| **Rejected** | 🔴 Red | Registration denied |
| **Deleted** | 🗑️ — | Permanently removed |

---

## 6. Dashboard — Overview

### 6.1 Stats Row (Top Cards)

| Card | Data |
|------|------|
| Total Schools | e.g., 47 |
| Active Schools | e.g., 38 |
| Trial Schools | e.g., 5 |
| Pending Requests | e.g., 4 |
| Suspended | e.g., 2 |
| Revenue | e.g., ₹1,24,000/mo |

### 6.2 Recent Activity Feed
- Live log of actions: school approved, new registration, school suspended
- Timestamp + actor (which admin did it)

### 6.3 Charts
- **Bar chart**: Schools by status (Active / Trial / Suspended)
- **Line chart**: New schools added per month (last 12 months)
- **Pie chart**: Subscription plan distribution (Free / Basic / Premium)
- **Bar chart**: Feature usage across schools (AI enabled, Quiz enabled, etc.)

### 6.4 Quick Actions
- ➕ Add School
- 📋 View Pending Requests
- 📢 Send Platform Announcement
- ⚙️ Platform Settings

---

## 7. School Management

### 7.1 Schools List Page
- Table columns:
  | Column | Detail |
  |--------|--------|
  | School Name | Clickable → detail page |
  | School Code | Unique identifier (e.g., `SCH-2201`) |
  | City / State | Location |
  | Plan | Free / Basic / Premium |
  | Status | Badge (Active / Trial / Suspended…) |
  | Students | Total student count |
  | Joined | Date registered |
  | Actions | View · Edit · Suspend · Delete |

- **Search**: by school name, city, code
- **Filter**: by status, plan, date range
- **Sort**: by name, date, students
- **Bulk actions**: Suspend selected / Export list

### 7.2 School Detail Page
Full profile of a single school with tabs:

#### Tab 1: Overview
- School name, logo, address, contact email, phone
- Principal/HOD name
- School code + login credentials for Plan 1
- Status badge + change status button
- Date joined, trial expiry / renewal date

#### Tab 2: Features Enabled
- Toggle each Plan 1 feature ON/OFF for this school:

| Feature | Toggle |
|---------|:------:|
| AI Module | ✅/❌ |
| Quiz / Interactive | ✅/❌ |
| Paper Creator | ✅/❌ |
| Moderator Role | ✅/❌ |
| Subject-wise Attendance | ✅/❌ |
| SMS/Email Notifications (future) | ✅/❌ |

#### Tab 3: Subscription
- Current plan + price
- Billing cycle (Monthly / Yearly)
- Next renewal date
- Payment history table
- Change plan button

#### Tab 4: Usage Statistics
- Total students, teachers, moderators registered in their Plan 1
- Materials uploaded count
- Papers/quizzes created count
- AI usage count (if enabled)
- Last active date

#### Tab 5: Activity Log
- Timestamped log of all admin actions on this school
- e.g., "Plan upgraded to Premium — Admin Rahul — 2026-03-15"

#### Tab 6: Notes
- Internal admin notes about the school
- Not visible to the school

### 7.3 Actions Available

| Action | Who | Result |
|--------|-----|--------|
| **Activate** | Admin | School gains full access |
| **Suspend** | Admin | School locked out with message |
| **Reactivate** | Admin | Restores access |
| **Change Plan** | Super Admin | Upgrades/downgrades subscription |
| **Reset Credentials** | Admin | Generate new school login code |
| **Delete** | Super Admin | Permanently removes school + all data |
| **Export Data** | Admin | Export school's user list (CSV) |

---

## 8. School Registration & Onboarding

### 8.1 School Self-Registration Flow

```
School visits: admin.eduportal.com/register
         ↓
Fills Registration Form:
  - School Name
  - NEP 2020 Stages (Foundational / Preparatory / Middle / Secondary)
  - Address, City, State, PIN
  - Principal Name + Contact Email + Phone
  - Approximate Student Strength
  - How did you hear about us?
  - Agree to Terms & Conditions
         ↓
Submits → Status = PENDING
         ↓
Admin receives notification: "New registration request"
         ↓
Admin reviews on /registrations page
         ↙              ↘
   REJECTED           APPROVED
       ↓                  ↓
Email sent:          Email sent:
"Not approved"       School Code + Plan 1 login link
                     Trial starts (30 days)
```

### 8.2 Manual School Creation by Admin
- Admin goes to `/schools/new`
- Fills same form as registration
- Sets initial status (Trial / Active)
- Assigns plan
- Generates school code
- System creates school entry immediately

### 8.3 School Onboarding Checklist
After approval, admin tracks onboarding:
- [ ] Welcome email sent
- [ ] School code provided
- [ ] HOD account set up in Plan 1
- [ ] Demo walkthrough scheduled (optional)
- [ ] Moderator account created
- [ ] First teacher added

---

## 9. Feature Control Per School

> Each school can have a different set of features enabled.
> This is controlled from the School Detail → Features tab.

### Global Feature Flags (Platform-wide)
Set by Super Admin — overrides all school settings:

| Flag | Effect |
|------|--------|
| AI Module Available | If OFF globally, no school can enable AI |
| New Registrations Open | If OFF, registration form is closed |
| Trial Period (days) | Default 30 days, configurable |
| Max Students per School | Platform limit per plan |

### Per-School Feature Flags
Set by Admin on School Detail page:

| Feature | Plans it applies to |
|---------|-------------------|
| AI Module | Premium only (or manual override) |
| Quiz / Interactive Test | Basic + Premium |
| Paper Creator | Basic + Premium |
| Moderator Role | All plans |
| Subject-wise Attendance | Basic + Premium |
| Advanced Analytics | Premium only |

---

## 10. Subscription & Plan Management

### 10.1 Plans

| Plan | Price | Students | Features |
|------|-------|:--------:|----------|
| **Free Trial** | ₹0 / 30 days | Up to 100 | All features unlocked for trial |
| **Basic** | ₹999/month | Up to 300 | Core features, no AI |
| **Standard** | ₹1,999/month | Up to 800 | Core + AI + Paper Creator |
| **Premium** | ₹3,499/month | Unlimited | All features + Priority support |
| **Custom** | Negotiated | Unlimited | Enterprise / large schools |

> *(Prices are indicative — adjust as needed)*

### 10.2 Subscription Management (Admin View)
- View all active subscriptions in a table
- Filter by plan, status, renewal date
- Flag schools with overdue payments (mock)
- Extend trial period for a school
- Upgrade/downgrade school plan
- Mark payment received (manual or Stripe webhook)

### 10.3 Renewal Alerts
- Admin sees alert: "5 schools renewing in next 7 days"
- Schools expiring soon flagged in dashboard
- Auto-suspend after X days past due (configurable)

---

## 11. Analytics & Reports

### 11.1 Platform-wide Analytics

| Metric | Chart Type |
|--------|-----------|
| Total schools over time | Line chart |
| Schools by status | Donut chart |
| Schools by plan | Bar chart |
| Schools by state/city | Table |
| Feature adoption (AI %, Quiz %) | Bar chart |
| Monthly new registrations | Bar chart |
| Trial-to-paid conversion rate | KPI card |

### 11.2 Per-School Analytics
Available on School Detail → Usage tab:
- Student/Teacher count
- Daily active users
- Materials uploaded
- Tests/quizzes created
- AI requests made (if enabled)
- Last login date per role

### 11.3 Export
- Export all schools list → CSV
- Export subscription report → CSV
- Export analytics summary → PDF

---

## 12. Admin User Management

> Only Super Admin can manage admin accounts.

### Admin List
- Table: Name | Email | Role | Last Login | Status
- Actions: Edit role | Suspend | Delete

### Add New Admin
- Name, Email, Role (Admin / Support)
- Send Supabase Auth invite link
- Set temporary password

### Admin Activity Log
- Log of every action taken by every admin
- Timestamp | Admin | Action | Target School
- Used for accountability and audit

---

## 13. Notifications & Alerts

### 13.1 Admin Notification Types

| Trigger | Notification |
|---------|-------------|
| New registration request | "New school registration: St. Mary's School" |
| Trial expiring (3 days) | "3 schools' trials expire in 3 days" |
| School self-suspended | "School ABC has been auto-suspended (payment)" |
| High usage alert | "School XYZ has exceeded student limit" |
| New admin login | "Admin Rahul logged in from new device" |

### 13.2 Platform Announcement
- Super Admin can broadcast a message to all schools' HOD/Principal
- Message shows as a banner on Plan 1 dashboard
- e.g., "Scheduled maintenance on May 5, 2:00–4:00 AM"

---

## 14. Real-time Chat System (Admin)

Admin has access to the global floating chat drawer (💬) to manage and participate in **Departmental Chats** and **Custom Chats**.

*   **Departmental Chats:** Admin can create a chat bridging the Admin, an Auditor, and a specific School's Principal/Teacher.
*   **Custom Chats:** Admin can create custom groups across the entire platform.
*   **Rule:** Students can never be added to these chats.

> **See `Chat_System.md` for full implementation details and cross-layer chat rules.**

---

## 15. UI/UX Design System

### Color Palette (Admin — distinct from Plan 1)

| Token | Color | Usage |
|-------|-------|-------|
| `--admin-primary` | `#0EA5E9` (Sky Blue) | Buttons, active nav |
| `--admin-secondary` | `#8B5CF6` (Violet) | Highlights, charts |
| `--success` | `#10B981` (Green) | Active status |
| `--warning` | `#F59E0B` (Amber) | Trial / expiring |
| `--danger` | `#EF4444` (Red) | Suspended / deleted |
| `--neutral` | `#64748B` (Slate) | Expired / pending |
| `--bg-dark` | `#0F172A` | Dark background |
| `--card-dark` | `#1E293B` | Card backgrounds |
| `--border` | `#334155` | Dividers |

> Admin uses **Sky Blue + Violet** palette to feel distinct from Plan 1's Indigo/Amber.

### Typography
- **Font**: Inter (same as Plan 1 — consistent brand)
- Heavier use of monospace for school codes

### Key Components
| Component | Used In |
|-----------|---------|
| Stat Cards | Dashboard overview |
| Data Table | Schools list, subscriptions |
| Status Badge | School status everywhere |
| Feature Toggle | School feature management |
| Activity Timeline | Activity logs |
| Tab Panel | School detail page |
| Confirmation Modal | Delete / suspend actions |
| Chart (Chart.js) | Analytics page |
| Search + Filter Bar | Schools list |
| Breadcrumb | School detail navigation |
| Toast Alert | Action feedback |

---

## 16. File & Folder Structure

```
SCHOOL/
│
├── admin/                        ← Plan 2 lives here
│   ├── index.html                ← Admin Login
│   ├── dashboard.html            ← Platform Overview
│   ├── schools.html              ← Schools List
│   ├── school-detail.html        ← Single School Management
│   ├── school-new.html           ← Add School Form
│   ├── registrations.html        ← Pending Requests
│   ├── subscriptions.html        ← Plans & Billing
│   ├── analytics.html            ← Platform Analytics
│   ├── admins.html               ← Admin User Management
│   ├── settings.html             ← Platform Settings
│   ├── notifications.html        ← Alerts & Logs
│   │
│   ├── admin-style.css           ← Admin-specific styles
│   └── admin.js                  ← Admin logic + Supabase Client
│
├── index.html                    ← Plan 1 Landing (School App)
├── student.html
├── teacher.html
├── hod.html
├── moderator.html
├── style.css
├── app.js
├── ai.js
├── School.md                     ← Plan 1 Document
└── Admin.md                      ← This document (Plan 2)
```

---

## 17. Data Models

### School (Registry)
```json
{
  "id": "SCH7878",
  "name": "St. Joseph's High School",
  "nepStages": ["Middle", "Secondary"],
  "address": "123 MG Road",
  "city": "Bangalore",
  "state": "Karnataka",
  "pin": "560001",
  "principalName": "Dr. Anita Sharma",
  "contactEmail": "principal@stjosephs.edu",
  "contactPhone": "+91 98765 43210",
  "studentStrength": 420,
  "status": "Active",
  "plan": "Standard",
  "trialStartDate": "2026-03-01",
  "trialEndDate": "2026-03-31",
  "activatedDate": "2026-04-01",
  "nextRenewal": "2026-05-01",
  "schoolCode": "SCH7878",
  "features": {
    "aiModule": true,
    "quizInteractive": true,
    "paperCreator": true,
    "moderatorRole": true,
    "subjectAttendance": true
  },
  "createdBy": "AD00001",
  "notes": "Large school, requested demo before signup.",
  "logoUrl": ""
}
```

### Admin User
```json
{
  "id": "AD00001",
  "name": "Rahul Verma",
  "email": "rahul@eduportal.com",
  "role": "Admin",
  "status": "Active",
  "lastLogin": "2026-04-28T09:00:00",
  "createdAt": "2026-01-01"
}
```

### Registration Request
```json
{
  "id": "REQ-0045",
  "schoolName": "Sunrise Academy",
  "nepStages": ["Foundational", "Preparatory"],
  "city": "Pune",
  "state": "Maharashtra",
  "principalName": "Mr. Arun Joshi",
  "email": "arun@sunriseacademy.in",
  "phone": "+91 91234 56789",
  "studentStrength": 180,
  "source": "Google Search",
  "submittedAt": "2026-04-27T14:30:00",
  "status": "Pending",
  "reviewedBy": null,
  "reviewedAt": null,
  "rejectionReason": null
}
```

### Subscription
```json
{
  "id": "SUB-1001",
  "schoolId": "SCH7878",
  "plan": "Standard",
  "pricePerMonth": 1999,
  "billingCycle": "Monthly",
  "startDate": "2026-04-01",
  "nextRenewal": "2026-05-01",
  "status": "Active",
  "paymentHistory": [
    { "date": "2026-04-01", "amount": 1999, "status": "Paid" },
    { "date": "2026-03-01", "amount": 1999, "status": "Paid" }
  ]
}
```

### Platform Settings
```json
{
  "aiAvailableGlobally": true,
  "newRegistrationsOpen": true,
  "defaultTrialDays": 30,
  "autoSuspendAfterDays": 7,
  "platformName": "EduPortal",
  "supportEmail": "support@eduportal.com",
  "plans": [
    { "name": "Basic", "price": 999, "maxStudents": 300 },
    { "name": "Standard", "price": 1999, "maxStudents": 800 },
    { "name": "Premium", "price": 3499, "maxStudents": -1 }
  ]
}
```

---

## 18. Integration with Plan 1

### How Admin Controls Plan 1

| Admin Action | Effect on Plan 1 |
|-------------|-----------------|
| Activate school | Plan 1 login works with school code |
| Suspend school | Plan 1 shows "Account suspended" message |
| Toggle AI feature | AI buttons appear/disappear in Plan 1 |
| Delete school | Plan 1 inaccessible, data cleared |
| Send platform announcement | Banner shown in Plan 1 HOD dashboard |

### School Code System
- Each school gets a unique **School Code** (e.g., `SJOS2201`)
- Plan 1 login page has a "School Code" field
- Admin enters code → system loads that school's data
- Suspended/expired codes show error message

### Data Sharing (Supabase RLS)
```
Admin creates school "SCH7878"
         ↓
Saved to: Supabase 'schools' table
         ↓
Plan 1 login checks: Supabase DB for inputCode
         ↓
If found + status === 'Active' → allow login
If found + status === 'Suspended' → show suspension message
If not found → "Invalid school code"
```

---

## 19. Development Phases

| Phase | What gets built | Status |
|-------|----------------|--------|
| 1 | Admin CSS + Design System | ⏳ Pending |
| 2 | Admin Login Page | ⏳ Pending |
| 3 | Platform Dashboard (overview + charts) | ⏳ Pending |
| 4 | Schools List + Search/Filter | ⏳ Pending |
| 5 | School Detail Page (all 6 tabs) | ⏳ Pending |
| 6 | Add School + Registration Requests | ⏳ Pending |
| 7 | Feature Toggles per School | ⏳ Pending |
| 8 | Subscription & Plan Management | ⏳ Pending |
| 9 | Analytics Page | ⏳ Pending |
| 10 | Admin User Management | ⏳ Pending |
| 11 | Integration with Plan 1 (school code system) | ⏳ Pending |
| 12 | Polish — Animations, Responsive, Dark Mode | ⏳ Pending |

---

## 🔗 Relationship Summary

```
YOU (Platform Owner)
        │
        ▼
 Admin Dashboard (Plan 2)
        │
        │ creates / manages / controls
        │
        ├──► School A (Plan 1 instance) — Active
        ├──► School B (Plan 1 instance) — Trial
        ├──► School C (Plan 1 instance) — Suspended
        └──► School D (Plan 1 instance) — Pending
```

---

*Document created: 2026-04-28 | Plan 2 · Version 1.0 | Status: Draft*
