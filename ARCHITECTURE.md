# EduPortal & EduOS: Hybrid Edge Architecture Specification

## Overview
EduPortal brings school operations, classroom work, compliance, AI grading, and student self-service into a single responsive web app built for daily use. To ensure uninterrupted operations in low-connectivity school environments, the platform utilizes a hybrid offline-first edge architecture via EduOS edge deployment helpers.

## 1. Core Hardware Infrastructure

### Class Station (Edge Server)
The Class Station acts as the resilient, centralized gateway for the physical classroom.
- **Routing:** Runs locally on `http://127.0.0.1:4102/school/teacher`.
- **Connectivity:** Connects to the external internet to ping cloud AI services (Gemini) and sync with the central database, but functions seamlessly offline via a "store-and-forward" queue.
- **Storage Management:** Equipped with 1.5TB of local storage to cache generated assets. Utilizes an automated First-In-First-Out (FIFO) cleaning mechanism that purges the oldest day of recordings/data to prevent storage overflow.
- **Capabilities:** Hosts the Teacher tools for offline AI paper generation, worksheet grading, and class analytics.

### Student Hub (Intranet Client)
The Student Hub operates strictly as a secure, offline thin-client.
- **Routing:** Runs locally on `http://127.0.0.1:4101/school/student`.
- **Connectivity:** Operates entirely on the local intranet without any outbound internet access. It tethers directly to the Class Station.
- **Capabilities:** Provides access to the Student desk for assignments, study material, live tests, and holistic progress cards.

## 2. The Studio Module & Hybrid AI Workflow
The Studio module is an AI-powered media factory integrated into the EduPortal Student desk. It allows students to take their study materials or notes and instantly transform them into interactive learning assets, specifically audio overviews, flashcards, quizzes, and slide decks.

### The Request Lifecycle
- **Local Request:** A student initiates an AI generation from their offline Student Hub.
- **Async Queuing:** The local Next.js API inserts a row into the Supabase `generations` table with a `pending` status.
- **Cloud Processing:** The Class Station detects this queue, uses its active internet connection to securely ping the Google Gemini API (or other configured LLM) for fast text/JSON generation.
- **Edge Caching:** The Class Station downloads the generated assets (e.g., structured JSON schemas or audio files) and updates the database status to `completed`.
- **Offline Delivery:** The Student Hub, listening via real-time subscriptions, pulls the cached asset locally from the Class Station and renders it in the browser.

## 3. Data Synchronization & Assessments
To ensure data sovereignty and actionable analytics, test data follows a strict local-to-cloud lifecycle.
- **Offline Test Execution:** Live tests and exams are conducted locally. The Student Hubs communicate with the Class Station, which maintains the active session without requiring internet.
- **Database Syncing:** Once the Class Station detects an internet connection, it pushes answer sheets, marks, and performance data to the central Supabase database.
- **Analytics Generation:** Persisting this data in the central database powers AI-powered OCR grading, generates holistic progress cards, and populates class analytics for teachers.

## 4. Fleet Management & Node Monitoring
Because Class Stations operate semi-autonomously as edge nodes, the ecosystem includes comprehensive oversight tools.
- **Telemetry:** Implements administrative analytics and hardware telemetry to monitor edge device health (e.g., storage capacity, compute loads during AI tasks).
- **Dashboard:** A fleet management and node monitoring dashboard tracks the sync status and operational health of all Class Stations across the campus.