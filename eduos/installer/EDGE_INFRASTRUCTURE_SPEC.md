# EduOS Edge Infrastructure Specification

## 1. Local AI Fallback

### Purpose
Provide resilient basic AI capabilities (e.g., text summarization, simple OCR, and basic question-answering) when the Class Station is entirely disconnected from the internet and cannot reach cloud APIs (like Google Gemini).

### Architecture
- **Model:** A lightweight, quantized local LLM (e.g., Llama-3-8B-Instruct-GGUF or Phi-3-mini-4k-instruct-q4) runs locally on the Class Station hardware.
- **Inference Engine:** Managed via a lightweight inference server like `Ollama` or `llama.cpp` to optimize memory footprint and CPU/GPU usage.
- **Routing Logic:**
  - The EduOS edge API (`/api/ai/...`) intercepts the incoming request from the Student Hub.
  - It checks network connectivity via a rapid ping or connection status flag.
  - If `online`: Routes the payload to the Cloud LLM API.
  - If `offline`: Modifies the payload if necessary and routes it to the local inference engine (e.g., `http://localhost:11434/api/generate`).

### Hardware Requirements
- Minimum 8GB RAM (16GB recommended) for smooth operation of quantized 8B models.
- Edge API timeout configurations must account for slower local inference speeds compared to cloud APIs.

---

## 2. Hardware Redundancy (RAID 1)

### Purpose
Protect against sudden hardware failure and data loss. Class Stations store critical, synced, and unsynced student assessments, encrypted credentials, and large cached media files.

### Configuration
- **Topology:** RAID 1 (Mirroring).
- **Drive Setup:** At least two physical drives of identical capacity (e.g., 2x 1.5TB SSD/HDD). Data written to the primary drive is simultaneously replicated to the secondary drive.
- **Management:** Enforced via software RAID (e.g., `mdadm` on Linux/EduOS base image) or hardware RAID controller, depending on the physical node deployment.
- **Impact on Existing Systems:**
  - The previous purely FIFO (First-In-First-Out) storage management logic remains in place for capacity management (purging old data when disks are nearly full).
  - The RAID setup ensures hardware resilience beneath the software layer.
- **Monitoring:** The EduOS telemetry agent must read RAID health status (e.g., `/proc/mdstat`) and report degraded arrays back to the central Fleet Management Dashboard.

---

## 3. Offline Authentication Proxy

### Purpose
Supabase JWTs inevitably expire. In long-term offline scenarios, teachers and students still require authenticated access to their respective Hubs.

### Architecture
- **Local Auth Proxy:** A standalone Node.js/Go service running on the Class Station that sits between the Hubs and the local database copy.
- **Token Generation:** 
  - Upon initial deployment or a successful cloud login while online, the local Auth Proxy generates its own secure, cryptographically signed offline JWTs (or opaque tokens).
  - These are distributed to the clients (Student Hub/Teacher Hub) and mapped to their Supabase user IDs.
- **Offline Validation:**
  - When offline, API requests from the Hubs pass through the Local Auth Proxy.
  - The Proxy validates the signature of the offline token using a locally stored secret (provisioned during setup).
  - If valid, the proxy injects the associated User ID into the request headers and forwards it to the local Next.js API or local database interface.
- **Security Considerations:**
  - Offline tokens should have rolling expirations that refresh during local activity, or a hard limit that forces a cloud sync within a reasonable timeframe (e.g., 30 days) to prevent indefinite, unrevokable offline access if a device is compromised.