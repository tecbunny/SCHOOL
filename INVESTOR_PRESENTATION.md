---
theme: default
class: text-center
highlighter: shiki
lineNumbers: false
---

# EduPortal & EduOS: Revolutionizing Indian Education
## Investment Pitch Deck & Detailed Business Report
### Funding Ask: Minimum 1 Crore INR Convertible Note

**Our Mission:** Let teachers focus ONLY on teaching. EduPortal seamlessly handles administration, compliance, and operational tasks.

---

# 1. Executive Summary: The Administrative Crisis in Schools

The Indian education system faces a systemic challenge: educators are drowning in administrative overhead.

### The Realities on the Ground:
- **Teacher Burnout:** Teachers spend up to 40% of their working hours taking attendance, creating lesson plans, grading worksheets manually, and maintaining Holistic Progress Cards (HPCs).
- **Inefficient Compliance:** Meeting National Education Policy (NEP) 2020 guidelines requires massive amounts of manual reporting, pulling leadership focus away from academic strategy.
- **The Connectivity Gap:** Most advanced SaaS solutions fail in Tier 2, Tier 3, and rural schools due to intermittent internet access.
- **Paper Dependency:** Massive physical paper waste from constant printing of worksheets, exam papers, notices, and progress reports.

**The Consequence:** Reduced teaching quality, unequal access to modern educational tools, and massive inefficiencies.

---

# 2. The Solution: A Hybrid Cloud-Edge Architecture

We have built a proprietary, locally optimized education system natively designed for the unique challenges of the Indian infrastructure.

### A. EduPortal (The Cloud Command Center)
A robust Next.js and Supabase platform serving distinct, role-based environments for:
- **Admins & Auditors:** Platform control, NEP compliance, and global analytics.
- **Principals & HODs:** Institutional snapshots, timetable management, and staff performance metrics.
- **Teachers:** AI-assisted grading, automated curriculum generation, and class tracking.
- **Students & Parents:** Digital ID cards, live test engines, peer reviews, and interactive study hubs.

### B. EduOS Edge Devices (The Offline Lifeline)
A custom Linux-based edge computing solution for schools:
- **Resilient Offline Mode:** Local servers act as the "cloud" when internet drops.
- **Seamless Sync Engine:** Uses Lamport clock tracking and edge versioning to sync data back to the central Supabase database once connectivity returns, ensuring zero data loss.
- **Student Hub Distribution:** Secure checkout and management of devices for interactive classroom learning.

---

# 3. Core Technological Capabilities (Fully Functional in Code)

Our existing Next.js/Supabase codebase is feature-rich and production-ready:

### AI & Automation
- **AI Vision Auto-Grading (`/api/ai/vision-grade`):** Teachers scan a batch of worksheets; our AI interprets student handwriting, scores the exam, and directly updates the student's Holistic Progress Card.
- **Syllabus & Material Generation:** Generative AI tools (`/api/ai/generate`) instantly create lesson plans and study materials.
- **90% Less Paper Waste:** By combining OCR worksheet digitization, live digital test engines, and digital study hubs, we drastically reduce the school's environmental footprint.

### Biometrics & Hardware Integration
- **Face Verification API:** Completely automates morning and class-wise attendance via edge-connected biometric cameras. No more roll calls.
- **Hardware Telemetry:** Fleet management for thousands of devices with OTA updates and offline health dashboards.

### NEP 2020 Compliance Engine
- **Auditor Dashboards:** Dedicated `/auditor` portal providing real-time engagement heatmaps.
- **Automated Certifications:** Digital logs and compliance reporting generated automatically from daily school operations.

---

# 4. Impact: Let Teachers Teach

We fundamentally change the role of the educator by automating the friction.

| **Task** | **Traditional Method** | **EduPortal Method** |
| :--- | :--- | :--- |
| **Attendance** | 15 mins daily manual roll call. | 0 mins. Face verification at the door logs it instantly. |
| **Grading** | 10+ hours weekly grading paper tests. | 5 mins. AI vision grading scans, scores, and records. |
| **Timetables** | Days of manual scheduling by HODs. | Instantly generated, auto-resolving substitute conflicts. |
| **Lesson Plans** | Hours of researching and writing. | 1-click AI generation mapped to the curriculum. |
| **HPC Reports** | Weeks of manual data entry at term end. | Auto-compiled throughout the year from daily data points. |

---

# 5. Business Model & Scale Potential

Our revenue model is designed for high retention and scalable recurring revenue.

### B2B SaaS + Hardware Subscriptions
- **Platform Licensing:** Tiered annual SaaS subscription based on student enrollment.
- **Hardware Deployment:** One-time cost (or leased model) for EduOS Edge servers and biometric cameras.
- **AI Add-Ons:** Premium usage tiers for advanced OCR and AI lesson generation capabilities.

### Target Market & Expansion Strategy
- Over 1.5 Million schools in India.
- **Initial Focus:** Private institutions in Tier 2/Tier 3 cities needing a competitive, modern edge without relying on expensive, continuous gigabit internet.
- **Government Rollout:** We are actively planning discussions with state and central governments to mandate and install EduPortal across all government schools, ensuring nationwide standardized education and true NEP 2020 compliance at scale.

---

# 6. Use of Funds: 1 Crore INR Minimum Investment

**We are seeking this investment on an urgent basis** and are structuring it as a Convertible Note (debt which can convert into equity) to fund our next critical phase of growth. 

### Capital Allocation Breakdown:
1. **40% - Hardware Trial Phase & Deployment:** 
   - Manufacturing and staging custom EduOS Edge devices and biometric cameras.
   - Deploying our system into initial trial-phase partner schools to prove 100% offline resilience and demonstrate massive ROI in teacher time saved.
2. **30% - Engineering & AI Scale:**
   - Scaling our Supabase and AI backend architecture to support concurrent usage across thousands of students.
   - Refining the AI Vision grading models for varied Indian handwriting styles and regional languages.
3. **20% - Security & Compliance Audits:**
   - Conducting thorough third-party penetration testing and data enclave securing to ensure student data privacy meets national standards.
4. **10% - Operations & Go-to-Market:**
   - Marketing materials, sales team onboarding, and legal structuring for the convertible note and school contracts.

---

# 7. Why Us? Why Now?

- **The Code is Built:** We are not pitching an idea; we are pitching a fully functional, sophisticated codebase specifically tailored for India.
- **Timing:** NEP 2020 is forcing schools to digitize and adopt Holistic Progress Cards.
- **Unique Moat:** Our offline-first Lamport sync engine and custom EduOS hardware create a massive barrier to entry for standard, web-only competitors.

**Join us in giving back millions of hours to Indian educators.**
*Contact us to schedule a live product demonstration and review our technical architecture.*