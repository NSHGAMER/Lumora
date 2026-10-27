# Professor demonstration guide

## Prepare an isolated local campus

Requirements: Node 24, Python 3.13, and MongoDB (Atlas dedicated demo database or local MongoDB). Keep the development terminals/processes running throughout the presentation. A closed dev process causes `ERR_CONNECTION_REFUSED`; Vite is not a permanent Windows service.

1. From the repository root, run `npm ci`.
2. Create the backend environment: `python -m venv backend/.venv`, then `backend/.venv/Scripts/python -m pip install -r backend/requirements.lock` on Windows. On macOS/Linux use `backend/.venv/bin/python`.
3. Copy `backend/.env.example` to ignored `backend/.env`. Set `LUMORA_ENV=development`, `MONGODB_URI=mongodb://127.0.0.1:27028`, `MONGODB_DATABASE=lumora_professor_demo`, and a locally generated random `JWT_SECRET_KEY`. Keep CORS allowing `http://localhost:5173` and cookie SameSite `lax`.
4. For local MongoDB with Docker: `docker compose -f compose.demo.yaml up -d`. This binds only loopback and persists data in a named volume. Alternatively start an existing local MongoDB on port 27028. Do not overwrite a real institution's database.
5. Copy root `.env.example` to ignored `.env.local` and set `VITE_API_BASE_URL=http://localhost:8000`. Use `localhost` consistently for the frontend and API to avoid cookie host mismatches.
6. From `backend`, run `.venv/Scripts/python -m app.seed_demo`. It prompts for a demonstration password and refuses production, a database name not ending `_demo`, or a database already containing users. It creates visibly labelled DEMO fixtures. Do not run seeding again on the same database.
7. In three terminals run: backend `.venv/Scripts/python -m uvicorn app.main:app --host localhost --port 8000`; backend `.venv/Scripts/python -m app.worker`; root `npm run dev -- --host localhost`. On Windows `powershell -File scripts/start-local.ps1` starts these in hidden background processes with logs/PIDs in `.task-temp/dev-logs`; it refuses occupied frontend/API ports. MongoDB must already be running.
8. Open `http://localhost:8000/api/v1/ready`: expect HTTP 200, `status: ready`. Open `http://localhost:5173`.

The seeded identifiers are `DEMO-STUDENT`, `DEMO-FACULTY`, `DEMO-ADMIN`, `DEMO-MANAGEMENT`, `DEMO-STAFF`. All use the demonstration password you entered. No password is stored in this guide or source. Sign in normally; the frontend has no fake-login bypass.

## Demonstration sequence

1. **Identity:** Show the original landing visuals. Explain Lumora — Knowledge + Light; Campus OS — Campus Optimising System; JSR — Justified Semantic Reasoning. Showcase metrics/scenarios are illustrative.
2. **Student:** Launch Command Center → sign in as DEMO-STUDENT. Show database-backed counts, notices and notifications. Open My timetable; show only the enrolled DEMO BCA class, Full week and day filters. No publish/catalog buttons appear. Reload to show refresh-cookie continuity.
3. **Faculty:** Account settings → Sign out. Sign in as DEMO-FACULTY. Show the faculty's assigned sessions. Request change on a session; choose a free day/period and enter a clear DEMO reason. The published timetable remains unchanged while the request is pending.
4. **Administrator:** Sign out and sign in as DEMO-ADMIN. My timetable → Manage catalog. Review classes/semesters/sections, rooms, chronological periods, faculty availability/workload, subjects (including a consecutive two-period laboratory), and student enrollments tied to the existing directory. Saving invalidates the draft but preserves the last publication. Generate each class before publishing a complete catalog.
5. **Conflict:** Select Move on one lecture and choose another lecture's day, starting period and room. Save must show HTTP 409 scheduling conflict and preserve the stored draft. A lab cannot cross a break or the end of the day.
6. **Approval/publication:** Approve the faculty request into the draft. Observe the unpublished-changes message. Publish, then sign in as student/faculty and show the updated session. The worker creates genuine in-app publication/decision notifications.
7. **Directory:** Admin Campus → Directory → Edit profile for DEMO Faculty. Set a DEMO department/office; save and reload. Search/filter the saved profile. Self-service Account settings edits persist through the same directory API.
8. **Notice/calendar:** Admin Campus → Announcements → Create announcement; label it DEMO. Save a title/body/audience. In Calendar, create a DEMO event with start/end local times; verify returned dates. Sign in as an allowed recipient to see the record; excluded roles must not receive it.
9. **JSR sources:** With a real provider configured, Campus → Knowledge → create plain-text institutional source and approve it for selected roles. Ask a matching question in JSR. Show answer kind, source title/text, and compare with the saved source. Ask about the published timetable. Ask an unknown policy question and show the explicit missing-information clarification. An unapproved or role-excluded document must not reach the provider (automated integration tests cover this).
10. **Provider absent:** Without `AI_BASE_URL`, `AI_MODEL`, `AI_API_KEY`, a question with known sources must report provider-not-configured; it must not pretend to produce AI output. Explain this external-service blocker before the demo. Voice is browser-dependent and requires permission; text works without microphone access.
11. **Automation:** Admin Campus → Automation. Show heartbeat and event execution history. Schedule a DEMO reminder for a time already due, then refresh history after the next worker tick. Expect one succeeded run and one in-app notification per intended recipient. Stop the worker, schedule another reminder, restart it and show catch-up; refreshing/restarting does not duplicate the same run's recipient notifications. Retry/expired-lease recovery is also exercised by the integration suite.
12. **Permissions/logout:** Student Campus has no Accounts/Automation controls; backend tests also prove direct privileged calls return 403. Sign out and open the timetable: authentication is required again. External email, SMS, WhatsApp and calling are explicitly unavailable.

## Honest limits to explain

The production backend and real AI call require the user's services. The weekly scheduler has no holiday calendar, term-effective substitutions, or guaranteed optimal placement. JSR retrieves approved plain text and current records with bounded keyword ranking; it does not upload PDFs, maintain vector embeddings, or perform autonomous writes. Source IDs are validated, but semantic correctness still needs human review. Self-service lost-password recovery/email is not configured; changing a known password in Account settings is real. Worker history shows completion/failure; delivery channels beyond in-app are absent.

## Verification before presenting

Run the commands in README and inspect VERIFICATION.md. Check readiness, worker heartbeat, login/reload/logout, one publish and notification, and a real AI question if credentials are configured. Use a separate browser profile or sign out between roles. Never demonstrate production with the isolated fixture password.
