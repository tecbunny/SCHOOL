# EduPortal Changes Completed Today

## 1. Offline-First Sync Is Working

EduPortal now has an append-only event sync foundation.

Instead of depending only on direct updates, the system can record student, exam, attendance, grade, and device actions as ordered events. This makes offline sync safer because data is not overwritten during conflicts.

The system now supports logical ordering using version counters, so it does not depend only on device time.

## 2. Live Test Auto-Save Is Working

The live test flow now protects students during power cuts, Wi-Fi drops, and accidental reloads.

Every answer is saved locally as soon as the student selects it. If the device restarts or the network drops, the student can continue from the saved state.

Final submit now retries in the background with random delay, so many students submitting together will not overload the local station.

Question order and option order are also randomized per student to reduce copying.

## 3. APAAR / ABC Student Identity Support Is Working

EduPortal now supports the correct NEP-style student model.

Students are no longer treated only as school-bound records. The system now supports a global student identity linked to APAAR / ABC ID, with separate school enrollments.

This allows student transfers, promotions, alumni history, and lifelong HPC tracking across schools.

## 4. Offline Health Dashboard Is Working

A local health dashboard is now available for Class Station and school operations users.

It can show offline status, storage pressure, pending exam sync data, and clear teacher-friendly instructions.

It also generates a QR code support bridge so a teacher can scan diagnostics with a phone when the Class Station has no internet.

## 5. Grade Version Protection Is Working

Grade updates now use a version counter.

This protects against wrong results caused by broken device clocks. If a Class Station clock resets to an old date, the newer grade edit still wins because the version number is higher.

This supports the rule that grades originate from the teacher/Class Station side.

## 6. Cryptographic Hardware Trust Is Working

Hardware requests now support signed verification.

Class Stations can be registered with a public key, and sensitive hardware requests must be signed by the matching private key.

This prevents students from spoofing headers such as fake device IDs.

Replay protection was also added so copied old requests cannot be reused.

## 7. Face Embedding Verification Is Working

The face verification flow now supports sending small face embeddings instead of video streams.

Student Hubs do not need to stream live video over Wi-Fi. They can send compact mathematical face data, and the Class Station/server flow can compare it against stored templates.

This reduces bandwidth and supports faster classroom verification.

## 8. Hub Distribution Mode Is Working

A high-speed classroom Hub distribution workflow is now available.

Teachers can pair a recognized student with a physical Student Hub using a scanner-style QR workflow.

The system records which student has which Hub.

At the end of class, the teacher can end the session and lock all checked-out Hubs remotely. Student Hubs sign out and return to the locked state.

## 9. Build Verification Passed

The project was checked after the changes.

TypeScript passed.

Lint passed with only existing warnings.

Production build passed.
