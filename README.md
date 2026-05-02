# EduPortal Working Model

EduPortal is a Next.js school operations web app with admin, auditor, school, teacher, and student workflows. It includes Supabase-backed API routes, EduOS edge deployment helpers, and a pitch deck for presentation.

## Kept Deliverables

- Working web model source: `src/`, `public/`, `supabase/`, and project config files.
- EduOS edge model scripts and deployment helpers: `eduos/`.
- Pitch deck: `PITCHDECK_ASK_1CR_CONVERTIBLE_NOTE.pptx`.

## Run The Web App

```powershell
npm install
npm run dev
```

Open `http://localhost:3000`.

## Production Check

```powershell
npm run build
```

The latest check completed successfully on May 2, 2026.

## Build EduOS Images

```powershell
.\eduos\build-role-images.ps1
```

This creates:

- `eduos\images\student-hub-v1.0.0.img`
- `eduos\images\class-station-v1.0.0.img`

## Test In App VM

```powershell
.\eduos\vm\start-both-vms.ps1
```

Student Hub runs on `http://127.0.0.1:4101/school/student`.
Class Station runs on `http://127.0.0.1:4102/school/teacher`.

## Notes

- Environment values belong in `.env.local`.
- Principal password reset uses a short-lived admin-generated authorization code.
- Generated folders such as `.next/`, `node_modules/`, and build info files can be recreated and are not part of the clean handoff.
