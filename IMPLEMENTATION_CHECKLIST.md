# Lumora implementation audit — 2026-10-22

Baseline: clean `main` at `4442a98`; existing FastAPI/PyMongo, Argon2id,
JWT access tokens in memory, rotating HttpOnly refresh cookies, canonical roles,
directory repositories/API, and 153 previously documented backend tests.
Frontend baseline lint and production build pass; large 3D bundle warning remains.

Observed gaps: faculty self-registration, unguarded campus routes, simulated JSR,
invented dashboard/timetable/facility data, no academic persistence or worker.
No local MongoDB/AI credentials found. Existing Vercel Vite project is accessible.
The supplied ZIP contains a nested ZIP. Its scheduler checks occupied slots, but
splits labs into single periods, stores one separate demo state, and accepts demo
role headers. Reuse scheduling concepts only; preserve canonical Lumora auth.

- [x] Inspect repository, governance, authentication, directory and ZIP.
- [x] Secure registration, origin validation, errors, profile/password operations.
- [x] Persistent academic catalog, enrollment, conflict-safe drafts/publication.
- [x] Database-backed dashboards, directory, announcements, events, notifications.
- [x] Source-aware JSR/provider adapter, approved knowledge and browser voice implementation.
- [ ] Real AI provider verification (credentials not supplied).
- [x] Durable restricted workflow worker with retries, leases and deduplication.
- [x] Isolated fixtures, backend tests, frontend checks and browser verification.
- [x] Demo/deployment guides and backend milestone commit.
- [ ] Push, safe release and frontend URL verification.
- [ ] Production API/worker/Atlas provisioning and end-to-end verification (services deferred by user).

Keep the public landing components and navbar visually unchanged. No n8n,
second identity system, production fixtures, fake deliveries or fabricated facts.
Production readiness remains unverified until real services pass end-to-end tests.
