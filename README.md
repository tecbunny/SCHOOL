# EduPortal: The Multi-Tenant Educational Management Ecosystem

EduPortal is a high-performance, multi-tenant platform designed to orchestrate entire school ecosystems. It bridges the gap between cloud-scale administration and low-latency, offline-capable classroom execution on edge hardware (**EduOS Kiosks**).

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18.x or 20.x
- Supabase Account & Project
- Google AI Studio API Key (for Gemini features)

### 2. Environment Configuration
Copy `.env.example` to `.env.local` and fill in your credentials:
```bash
cp .env.example .env.local
```
Key variables:
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase Project URL.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase Anon Key.
- `GEMINI_API_KEY`: Your Google Gemini API Key.
- `EDUOS_STANDALONE`: Set to `true` if deploying on kiosk hardware.

### 3. Database Setup
1. Execute the schema in `supabase/DB.sql` in your Supabase SQL Editor.
2. Apply the hardening migrations in `eduportal-web/supabase/migrations/` in order.
3. (Optional) Seed initial data using `supabase/seed_data.sql`.

### 4. Installation & Development
```bash
npm install
npm run dev
```

## 🏗️ Architectural Blueprint

### 1. The Cloud Layer (Control Tower)
Managed via Route Groups `(auth)` and `(dashboard)`. Handles tenant orchestration, school lifecycle, and global config.

### 2. The Institutional Layer (Staff Hub)
Separated into role-based dashboards:
- **Principal/HOD**: Attendance policies, staff management, and CPD tracking.
- **Moderator**: Syllabus digitization and institutional content library.
- **Teacher**: AI assessment generation, split-screen grading, and live monitoring.

### 3. The Edge Layer (Student Portal & EduOS)
Optimized for touchscreens with offline-first capabilities and Luckfox hardware integration.

## 🛡️ Security & AI
- **Supabase RLS**: Strict multi-tenant isolation ensuring school data privacy.
- **Gemini AI**: Pedagogy-aware context indexing and subjective grading engine.
- **Middleware Protection**: Server-side auth verification for all dashboard routes.
- **Silent Provisioning**: Secure staff account creation via service roles.

## 📟 EduOS Build & Deployment
For hardware deployments (Luckfox Pico Ultra / RV1106):
1. Run the build script on Windows (PowerShell):
   ```powershell
   ./eduos/build-eduos.ps1
   ```
2. Flash the generated `eduos-v1.0.0.img` to an SD card using Etcher.
3. Boot the hardware node for automatic synchronization.

---
© 2026 EduPortal Ecosystem. Next-Gen Education Management.
