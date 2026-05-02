# EduPortal Detailed Working Report (Non-Technical)

Date: 2026-05-02  
Project: EduPortal Ecosystem  
Developed and managed by: Tecbunny Solutions Private Limited  
Project handled by: Co-founder Shubham Bhisaji  
Email: shubham@tecbunny.com  
Mobile: +91 7387375651  

## 1. What EduPortal Is

EduPortal is a complete school operating system. It connects school administration, principals, teachers, students, assessments, reports, AI assistance, compliance, and classroom devices into one workflow.

The goal is simple: schools should not need one tool for admissions, another for attendance, another for tests, another for report cards, another for learning material, and another for classroom devices. EduPortal brings these daily school activities into one connected system.

## 2. What Has Been Updated

The current project files show that EduPortal has moved beyond a basic dashboard. The system now includes:

- Secure school provisioning.
- Principal, teacher, moderator, student, auditor, and admin workflows.
- Staff account creation without exposing passwords in the browser.
- Offline-ready live tests.
- Local classroom QR login that can work even when internet is weak.
- Student Hub and Class Station device model.
- Face verification through classroom station devices.
- Hardware request signing to stop fake device requests.
- APAAR/ABC student identity support.
- Grade version protection.
- Hub checkout and lock workflow for shared classroom devices.
- AI support for question generation, worksheet reading, and grading help.
- Compliance, engagement, HPC, and audit-oriented reporting tools.

## 3. The Problem It Solves

Many schools have software, but the daily school loop is still broken:

- Administration data is separate from classroom activity.
- Teachers repeat attendance, test, grading, and report work manually.
- Students use disconnected apps, paper, or shared devices without proper identity control.
- School leaders do not get a live picture of what is happening.
- Offline classrooms struggle when internet drops.
- AI tools are often separate from the actual school records.

EduPortal solves this by connecting the school office, classroom, student desk, teacher workflow, AI assessment, and reports.

## 4. Main Users

| User | What They Can Do |
|---|---|
| Admin | Create schools, approve requests, manage subscriptions, view analytics, manage fleet and settings |
| Principal/HOD | Create staff, configure rules, manage timetable, view school operations, reports, promotions, and compliance |
| Teacher | Run classes, deploy tests, monitor students, scan worksheets, grade work, and view class analytics |
| Moderator | Upload syllabus, study material, and learning content |
| Student | Study, take live tests, submit answers, view timetable/materials, and see progress |
| Auditor | Review compliance health, engagement, analytics, and generated reports |
| Hardware Device | Supports classroom identity, offline access, test delivery, telemetry, and updates |

## 5. How a School Starts

1. The admin creates a school using its U-DISE code.
2. The principal account is created automatically.
3. The principal receives login access through a secure delivery process.
4. The principal logs in and creates teacher and moderator accounts.
5. Teachers and moderators start preparing classes, material, timetable, and assessments.
6. Students use the student portal or Student Hub device.
7. Reports begin to build from real school activity.

Important update: passwords are no longer shown back in the browser during account creation. The system is designed so credentials are delivered through a secure channel.

## 6. Daily School Workflow

A normal day inside EduPortal works like this:

1. Staff log in to the school workspace.
2. Teachers open their class tools.
3. Students access the Student Desk or classroom Student Hub.
4. The Class Station verifies the student using face and QR flow.
5. Teacher starts class activity or live test.
6. Student work is saved continuously.
7. If power or internet drops, the test state can recover from local storage.
8. Final submission syncs when the system is available.
9. Teacher grades manually or with AI help.
10. Progress, reports, compliance, and analytics update.

## 7. Student Hub and Class Station

EduPortal uses two classroom device types.

| Device | Meaning |
|---|---|
| Student Hub | A student desk device for study, tests, timetable, materials, and progress |
| Class Station | A classroom device controlled by teacher/school for QR scanning, face verification, local cache, and device management |

Why two devices:

- Student Hubs do not need cameras.
- The Class Station handles face verification in one supervised place.
- Classroom login can continue locally even during internet issues.
- Schools can check out hubs to students and lock them again at the end of class.

## 8. Classroom Login Flow

The current login flow is designed for real classrooms:

1. Student Hub asks the Class Station for a QR session.
2. Class Station creates a signed QR code.
3. Student Hub displays it.
4. Class Station verifies the student's face.
5. Class Station scans/verifies the QR.
6. Student Hub receives a signed unlock receipt.
7. Student can continue into the classroom session.

This is important because the student device does not need to depend on Supabase/cloud QR unlock during an internet outage.

## 9. Live Tests and Offline Protection

The live test system now protects students better.

Current behavior:

- Answers save as the student works.
- Test state is saved in browser storage and IndexedDB.
- A refresh, app suspend, or low-memory device event should not immediately destroy the student's progress.
- Submissions retry in the background.
- Test timing uses server/station-issued deadline information.
- The system records whether a submission is late instead of trusting only the student's screen timer.

This is a major improvement for classrooms where Wi-Fi, power, or device memory may be unreliable.

## 10. Student Identity and APAAR/ABC

EduPortal now supports a better student identity model.

Instead of treating a student only as a record inside one school, the platform can link a student profile to APAAR/ABC identity and separate that from school enrollment.

This helps with:

- Transfers between schools.
- Alumni records.
- Long-term progress history.
- Holistic Progress Card continuity.

## 11. AI Assistance

AI is used to help teachers and schools, not to replace final teacher judgment.

AI-supported workflows include:

- Question paper generation.
- Worksheet text extraction.
- Vision-based grading suggestions.
- Rubric-based feedback.
- Study and assessment support.

The system also includes rate limits and role controls so students cannot use AI to generate full exam papers.

## 12. Reports and Compliance

EduPortal supports reporting for multiple stakeholders:

- Teachers can view class and assessment progress.
- Principals can view school operations and snapshots.
- Students can view HPC progress.
- Auditors can review compliance health and generated reports.
- Admins can view platform-level analytics and school activity.

The current system also has the foundation for stronger audit logs. The next production step is to stream critical logs to an immutable audit storage system.

## 13. Hardware Trust

The hardware layer has been strengthened.

Class Stations and other hardware nodes can now use signed requests. This means the server can check that a request really came from a registered device, not from someone pretending to be a device.

This protects:

- Telemetry.
- Face verification.
- Update checks.
- Sensitive classroom hardware actions.

## 14. Business Value

EduPortal creates value in five ways:

| Area | Value |
|---|---|
| School operations | Less manual work and fewer disconnected systems |
| Teachers | Faster test, grading, worksheet, and classroom workflows |
| Students | More reliable access to study, tests, and progress |
| Leadership | Better visibility into daily school activity |
| Investors/partners | A product that combines SaaS, AI, and classroom hardware |

## 15. Current Investment Context

The pitch deck is positioned around a Rs. 1 Cr seed ask, including convertible-note possibility. The goal is to fund product completion, pilot hardware, school onboarding, cloud/AI infrastructure, and go-to-market execution.

The near-term plan is:

1. Complete pilot readiness.
2. Run 5-10 school pilots.
3. Prove teacher usage, device reliability, and school reporting.
4. Build a 50-school pipeline.
5. Prepare for a larger institutional round.

## 16. Remaining Work Before Strong Pilot Readiness

EduPortal is much stronger than a simple prototype, but these items should be finished before serious B2G or large-network pilots:

- Real secure credential delivery through SMS/email/reset links.
- Full provisioning recovery if account creation fails halfway.
- Durable report projections from offline event sync.
- Stronger device key rotation and revocation.
- Immutable external audit storage.
- Production kiosk lockdown for EduOS.
- AI generation based on approved school content chunks.

## 17. Conclusion

EduPortal now has the shape of a complete school operating platform. It connects administration, classroom devices, teachers, students, AI, assessments, identity, offline workflows, and reports.

The most important current strength is that the platform is designed around real classroom conditions: shared devices, weak connectivity, identity verification, power interruptions, teacher workload, and school-level reporting. The next step is to harden delivery, audit, and device trust for paid pilots.
