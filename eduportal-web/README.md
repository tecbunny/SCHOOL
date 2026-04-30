# EduPortal: The Multi-Tenant Educational Management Ecosystem

EduPortal is a high-performance, multi-tenant platform designed to orchestrate entire school ecosystems. It bridges the gap between cloud-scale administration and low-latency, offline-capable classroom execution on edge hardware (**EduOS Kiosks**).

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Create a `.env.local` file with your Supabase and Gemini API keys.

### 3. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🏗️ Architectural Blueprint

### 1. The Cloud Layer (Control Tower)
Managed via Route Groups `(auth)` and `(dashboard)`. Handles tenant orchestration, school lifecycle, and global config.

### 2. The Institutional Layer (Staff Hub)
Separates operational concerns into role-based dashboards:
- **HOD / Principal**: Attendance policies & CPD tracking.
- **Moderator**: Syllabus digitization & material library.
- **Teacher**: AI Assessment generation & Split-screen grading.

### 3. The Edge Layer (Student Portal & EduOS)
Optimized for touchscreens with offline-first capabilities and live test engine integration.

## 🛡️ Security & AI
- **Supabase RLS**: Strict tenant isolation.
- **Gemini AI**: Pedagogy-aware context indexing and subjective grading.
- **Silent Provisioning**: Secure staff account creation via service roles.

## 📟 EduOS Integration
Standalone kiosk mode with Luckfox Edge node handshakes for classroom synchronization.

---
© 2026 EduPortal Ecosystem. Next-Gen Education Management.
