# 💬 EduPortal — Unified Chat System
## Chat_System.md

> **Purpose:** This document outlines the real-time chat architecture that connects users across all three layers of the EduPortal ecosystem (Admin, School, Auditor). 
> The system is powered by **Supabase Realtime**.

---

## 📌 Table of Contents

1. [Chat Architecture Overview](#1-chat-architecture-overview)
2. [Chat Types & Permissions](#2-chat-types--permissions)
3. [Type 1: Classroom Chats](#3-type-1-classroom-chats)
4. [Type 2: School Chats](#4-type-2-school-chats)
5. [Type 3: Departmental Chats](#5-type-3-departmental-chats)
6. [Type 4: Custom Chats](#6-type-4-custom-chats)
7. [Database Schema (Supabase)](#7-database-schema-supabase)
8. [UI/UX Implementation](#8-uiux-implementation)

---

## 1. Chat Architecture Overview

The chat system operates on **Supabase Realtime**, allowing instant message delivery across the web platform without refreshing. 

Since EduPortal is a 3-layer system (Admin, School, Auditor), the chat system acts as the **communication bridge** between these isolated layers. 

**Strict Rule:** Students are heavily restricted. They can only participate in chats explicitly related to their own school and classes. Students can *never* be added to cross-school or administrative custom chats.

---

## 2. Chat Types & Permissions Matrix

| Chat Type | Who Can Create | Who Can Participate | Purpose |
|-----------|----------------|---------------------|---------|
| **1. Classroom Chat** | Teacher | Teacher, Students of that class | Subject discussions, homework help |
| **2. School Chat** | Principal, Moderator | Principal, Moderator, Teachers, Students | Whole-school / multi-class groups |
| **3. Departmental Chat** | Admin | Admin, Auditor, Principal, specific Teachers | Cross-layer oversight, compliance |
| **4. Custom Chat** | Admin | Anyone **EXCEPT Students** | Direct messaging, staff groups |

---

## 3. Type 1: Classroom Chats

- **Created by:** Teacher
- **Scope:** Locked to a specific Plan 1 School and a specific Class/Subject.
- **Participants:** 
  - The Teacher who created it.
  - The Students enrolled in that specific class.
- **Features:**
  - Teacher has moderation powers (can delete messages, mute students).
  - Can share files (Supabase Storage).
  - Example: "Class 10-A Mathematics Discussion"

---

## 4. Type 2: School Chats

- **Created by:** Principal/HOD or Moderator
- **Scope:** Locked to a specific Plan 1 School.
- **Participants:** 
  - Principal/HOD
  - Moderator
  - Teachers (All or selected)
  - Students (All or selected groups)
- **Features:**
  - Used for large announcements with reply capabilities (e.g., "Annual Day Planning", "Science Club").
  - Can be set to "Broadcast Mode" (only Principal/Moderator can send, others can only read/react).

---

## 5. Type 3: Departmental Chats

- **Created by:** Admin (from Plan 2)
- **Scope:** **Cross-Layer.** Spans across Plan 1 (School), Plan 2 (Admin), and Plan 3 (Auditor).
- **Participants:**
  - **Admin** (The creator)
  - **Auditor** (Assigned to monitor)
  - **Principal/HOD** (Of the target school)
  - **Specific Teachers** (Optional - if the chat is about a specific subject department)
- **Features:**
  - Used for official reviews, compliance checking, and cross-platform communication.
  - Example: "St. Mary's Math Dept Audit - Admin + Auditor + Principal + Math Teacher"
  - Students are strictly barred.

---

## 6. Type 4: Custom Chats

- **Created by:** Admin (from Plan 2)
- **Scope:** **Cross-Layer.** Fully flexible.
- **Participants:**
  - Admin, Auditor, Principal, Moderator, Teacher.
  - **HARD RULE:** Students cannot be added under any circumstances.
- **Features:**
  - Used for 1-on-1 direct messaging (e.g., Admin DMing a Principal).
  - Used for custom groups (e.g., "All Principals in Maharashtra region").
  - Highly flexible but bounded by the "No Students" security rule via Supabase RLS.

---

## 7. Database Schema (Supabase)

To make this work across the 3 layers, the schema will look like this:

### `chat_rooms` table
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary Key |
| `name` | String | e.g., "Class 10-A Math" |
| `type` | Enum | `classroom`, `school`, `departmental`, `custom` |
| `school_id` | String | Foreign key to School (Null if cross-school custom chat) |
| `created_by` | String | User ID of creator |

### `chat_participants` table
| Column | Type | Description |
|--------|------|-------------|
| `room_id` | UUID | FK to chat_rooms |
| `user_id` | String | FK to users table (Admin/Teacher/Student etc.) |
| `role` | Enum | `owner`, `member`, `read_only` |

### `chat_messages` table
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary Key |
| `room_id` | UUID | FK to chat_rooms |
| `sender_id` | String | FK to users table |
| `content` | Text | The message body |
| `attachment_url` | String | Optional Supabase storage link |
| `created_at` | Timestamp | Message time |

> **Row-Level Security (RLS) Rule:** A user can only `SELECT` or `INSERT` into `chat_messages` IF their `user_id` exists in `chat_participants` for that `room_id`.

---

## 8. UI/UX Implementation

### Where does the Chat live?
- **Global Chat Drawer:** A floating chat bubble icon (💬) in the bottom-right corner of *every* dashboard (Admin, Auditor, Teacher, HOD, Moderator, Student).
- Clicking it opens a sliding drawer from the right side of the screen.

### Drawer UI
1. **Sidebar (Left):** List of available chat rooms the user is part of. Grouped by Type.
2. **Main Window (Right):** The active chat thread.
3. **Top Bar:** Chat Name, Participant count, "Add Participant" button (if creator).
4. **Bottom Bar:** Input field, attachment paperclip (Supabase Storage), Send button.

### Realtime Updates
- The chat UI subscribes to `supabase.channel('chat_messages').on('INSERT')`.
- When a new message arrives, the UI instantly appends it to the window and auto-scrolls to the bottom.

---
*Document Created: 2026-04-28 | EduPortal Chat System Blueprint*
