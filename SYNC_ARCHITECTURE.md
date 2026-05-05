# EduPortal Synchronization Architecture Specification

This document details the advanced synchronization, conflict resolution, and upload mechanics for EduPortal to operate reliably over weak, intermittent cellular connections and offline environments.

## 1. Conflict Resolution (CRDTs & Vector Clocks)

To handle concurrent modifications between the offline Class Station (e.g., teacher updating grades) and the cloud EduPortal (e.g., admin updating records), we employ a strict timestamp-based Vector Clock strategy paired with Last-Write-Wins (LWW) field-level resolution.

### Mechanism
- **Vector Clocks:** Every syncable table in our Supabase PostgreSQL database includes a `_version_vector` JSONB column. This stores a map of `node_id: counter`.
- **Hybrid Logical Clocks (HLC):** Along with the vector, each record has an `updated_at` timestamp.
- **Local Edits:** When an edge node (Class Station) makes an offline edit, it increments its node's counter in the `_version_vector` and updates `updated_at`.
- **Merge Strategy:** 
  - During sync, the edge node sends its changes. The cloud server compares the `_version_vector`.
  - If the cloud vector strictly dominates, local changes are rejected or merged.
  - If the vectors are concurrent (conflict), the system falls back to the HLC (`updated_at`). The edit with the latest timestamp wins (LWW).
  - *Role-Based Overrides:* For critical administrative fields, cloud admin edits deterministically win over edge teacher edits regardless of the timestamp.

## 2. Low-Bandwidth Sync Optimization

To accommodate weak cellular signals in rural schools, sync payloads must be hyper-optimized.

### Differential Synchronization
- Instead of transmitting full database rows, the edge node's sync worker computes a delta. It uses a local oplog (operations log) to track exactly which fields were mutated.
- The sync payload only contains the primary key and the modified columns (a JSON Patch).

### Strict Payload Compression
- **Serialization:** Payloads are serialized using MessagePack (or Protocol Buffers) instead of raw JSON to reduce overhead.
- **Compression:** The serialized payload is compressed using **Brotli** before transmission.
- **Transport:** The worker sends an HTTP POST to the Next.js API with `Content-Encoding: br`. The server decompresses the payload on the fly. This reduces JSON payload sizes by up to 80%, critical for 2G/3G networks.

## 3. Resumable Uploads for Media Assets

Audio generated from the Studio, scanned worksheets, and slide decks can be large. Syncing these over unstable networks requires resumption capabilities so interrupted uploads do not restart from 0%.

### Chunked Upload Protocol
- We implement a custom resumable upload handler in the Next.js API inspired by the **Tus protocol**.
- **Initialization:** The edge node requests an upload session, receiving a unique `upload_id`.
- **Chunking:** The media file is sliced into 1MB chunks locally.
- **Transmission:** The edge node uploads chunks sequentially via `PATCH` requests containing the `Upload-Offset` header.
- **Resumption:** If the cellular connection drops, the edge worker pings the server with a `HEAD` request to retrieve the last successful `Upload-Offset`. It then resumes uploading from that exact byte.
- **Completion:** Once all bytes are received, the Next.js API reassembles the chunks, verifies the checksum, and pushes the final file to Supabase Storage.
