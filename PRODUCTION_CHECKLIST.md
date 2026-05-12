# Production Checklist

Run these before promoting a deployment.

## Required Commands

```bash
npm run verify
npm audit --audit-level=high
npm run check:prod-env
```

## Supabase

- Apply every migration in `supabase/migrations`.
- Run Supabase security advisors after migrations.
- Confirm Auth leaked password protection is enabled in Supabase Auth settings.
- Confirm no `anon_security_definer_function_executable` or `authenticated_security_definer_function_executable` warnings remain.
- Confirm `school-files` does not allow broad object listing.

## Secrets

Production must use strong, non-placeholder values for:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GEMINI_API_KEY`
- `GATE_AUTH_SECRET`
- `GATE_STATION_SECRET`
- `HARDWARE_PROVISIONING_SECRET`
- `STUDIO_PROCESS_SECRET`
- `OFFLINE_AUTH_SECRET`

## Credential Delivery

- Ensure `credential_delivery_jobs` has an operational worker or manual secure procedure.
- Do not expose temporary passwords through API responses, browser UI, logs, screenshots, or support tools.
