# EduPortal & EduOS: Hybrid Edge Architecture Specification

## Overview
EduPortal brings school operations, classroom work, compliance, AI grading, and student self-service into a single responsive web app built for daily use. To ensure uninterrupted operations in low-connectivity school environments, the platform utilizes a hybrid offline-first edge architecture via EduOS edge deployment helpers.

## 1. Core Hardware Infrastructure

### Class Station (Edge Server)
The Class Station acts as the resilient, centralized gateway for the physical classroom.
- **Routing:** Runs locally on `http://127.0.0.1:4102/school/teacher`.
- **Connectivity:** Connects to the external internet to ping cloud AI services (Gemini) and sync with the central database, but functions seamlessly offline via a "store-and-forward" queue.
- **Hardware Redundancy (RAID 1):** The Class Station mandates a RAID 1 (Mirroring) storage setup. This enforces strict data redundancy across at least two drives, ensuring that local student data, pending sync queues, and cached assets are protected against single-drive hardware failure. This supersedes previous FIFO-only management by providing hardware-level resilience.
- **Storage Management:** Equipped with sufficient local storage (e.g., dual 1.5TB drives in RAID 1) to cache generated assets. Utilizes an automated First-In-First-Out (FIFO) cleaning mechanism that purges the oldest day of recordings/data to prevent storage overflow.
- **Capabilities:** Hosts the Teacher tools for offline AI paper generation, worksheet grading, and class analytics.

### Student Hub (Intranet Client)
The Student Hub operates strictly as a secure, offline thin-client.
- **Routing:** Runs locally on `http://127.0.0.1:4101/school/student`.
- **Connectivity:** Operates entirely on the local intranet without any outbound internet access. It tethers directly to the Class Station.
- **Capabilities:** Provides access to the Student desk for assignments, study material, live tests, and holistic progress cards.

## 2. The Studio Module & Hybrid AI Workflow
The Studio module is an AI-powered media factory integrated into the EduPortal Student desk. It allows students to take their study materials or notes and instantly transform them into interactive learning assets, specifically audio overviews, flashcards, quizzes, and slide decks.

### The Request Lifecycle & Local AI Fallback
- **Local Request:** A student initiates an AI generation from their offline Student Hub.
- **Async Queuing:** The local Next.js API inserts a row into the Supabase `generations` table with a `pending` status.
- **Cloud Processing & Local Fallback:** 
  - *Online:* The Class Station detects this queue and securely pings the Google Gemini API (or other configured cloud LLM) for high-fidelity text/JSON generation.
  - *Offline (Local AI Fallback):* If internet connectivity is unavailable, the Class Station intercepts the request and routes it to a lightweight, quantized local LLM (e.g., Llama-3-8B or Phi-3) running natively on the edge hardware. This ensures basic offline capabilities (like summarization and simple OCR) remain functional without blocking the queue.
- **Edge Caching:** The Class Station caches the generated assets (e.g., structured JSON schemas or audio files) and updates the database status to `completed`.
- **Offline Delivery:** The Student Hub, listening via real-time subscriptions, pulls the cached asset locally from the Class Station and renders it in the browser.

## 3. Data Synchronization & Assessments
To ensure data sovereignty and actionable analytics, test data follows a strict local-to-cloud lifecycle.
- **Offline Test Execution:** Live tests and exams are conducted locally. The Student Hubs communicate with the Class Station, which maintains the active session without requiring internet.
- **Database Syncing:** Once the Class Station detects an internet connection, it pushes answer sheets, marks, and performance data to the central Supabase database.
- **Analytics Generation:** Persisting this data in the central database powers AI-powered OCR grading, generates holistic progress cards, and populates class analytics for teachers.

## 4. Offline Authentication Handling
To support extended offline periods, EduOS implements a custom local authentication proxy on the Class Station.
- **Auth-Proxy Design:** Cloud-issued Supabase JWTs have standard expirations. The local auth-proxy acts as a secure intermediary on the Class Station.
- **Offline Tokens:** When a valid cloud login occurs (or via initial sync), the proxy issues short-lived offline tokens. 
- **Validation:** While disconnected, the Student Hub presents these offline tokens to the auth-proxy. The proxy validates them locally, allowing uninterrupted, secure access to the Student Hub and local assessments without needing to reach Supabase's external Auth servers.

## 5. Fleet Management & Node Monitoring
Because Class Stations operate semi-autonomously as edge nodes, the ecosystem includes comprehensive oversight tools.
- **Telemetry:** Implements administrative analytics and hardware telemetry to monitor edge device health (e.g., RAID array status, storage capacity, compute loads during AI tasks).
- **Dashboard:** A fleet management and node monitoring dashboard tracks the sync status and operational health of all Class Stations across the campus.

## 6. Advanced Synchronization & Connectivity

To ensure maximum reliability in extremely low-bandwidth and offline environments, EduPortal implements an advanced synchronization engine detailed fully in the [Sync Architecture Specification](SYNC_ARCHITECTURE.md):
- **Conflict Resolution:** Utilizes strict timestamp-based Vector Clocks and Hybrid Logical Clocks (HLC) in Supabase to gracefully merge concurrent offline edits (e.g., local grade updates vs. cloud admin overrides).
- **Low-Bandwidth Sync:** Employs differential synchronization (transmitting only modified columns) combined with MessagePack serialization and Brotli compression to minimize payload size over weak cellular connections.
- **Resumable Media Uploads:** The Next.js API supports chunked, resumable uploads for large media assets (Studio audio, slide decks). Uploads rely on byte-range tracking to resume interrupted transfers exactly where they left off without restarting.