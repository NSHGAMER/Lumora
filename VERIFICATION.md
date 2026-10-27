# Verification record — 2026-10-24

## Actual local results

- Clean Python 3.13 verification environment installed from pinned dependencies. Latest full run: **192 passed, 1 skipped**, 14.04 seconds. Seven upstream Starlette deprecation warnings remain. The skipped Atlas test requires explicit external credentials.
- `npm run lint`, `npx tsc -b`, `npm run build`: passed. `npm audit --audit-level=low`: zero vulnerabilities. Production bundle retains the original heavy 3D dependencies; Vite warns about the approximately 1.45 MB main JavaScript chunk (394 KB gzip).
- One rerun initially failed a configuration-default assertion because the worker's demo `MONGODB_DATABASE` override was inherited in the same shell. Running the suite with only `TEST_MONGODB_URI` restored all 192 passes; no test was removed or weakened.
- Real isolated MongoDB on loopback port 27028; API `http://localhost:8000`; frontend `http://localhost:5173`. The temporary database from the interrupted run was recreated with explicitly labelled fixtures; its data directory now persists locally. No production database was modified.

## Browser → API → database workflows observed

| Workflow | Evidence |
|---|---|
| Authentication / refresh / logout | Admin, faculty and student signed in through the normal form; full reload restored authentication through POST refresh 200; logout returned to protected-route authentication. |
| Catalog / student visibility | Admin changed DEMO BCA section A to B, saved catalog, generated and published. Student saw section B and the consecutive lab, with no move/publish/catalog controls; it survived reload. |
| Timetable conflicts / requests | Faculty submitted a move request, admin approved into draft, and publication succeeded. A conflicting manual move returned 409 with the occupied class/day/period and preserved the valid draft. |
| Directory | Admin edited DEMO Faculty department/office; PUT returned 200; saved values remained after reload. |
| Announcements | Browser-created DEMO notice returned 201 and appeared after a full reload. |
| Calendar | Browser uncovered omitted date state. Submission now reads date values from the form. Retest returned 201 and displayed the selected local start/end times. |
| JSR | Published-timetable question reached retrieval and returned an honest provider-not-configured 503. No real provider response is claimed. |
| Notifications | Worker delivered publication/announcement/reminder records; recipient dashboard showed them. Student mark-read persisted; cross-user read attempts are denied in integration tests. |
| Automation | Separate worker recorded succeeded runs with recipient counts; a due reminder created one durable run and delivered to five demo roles. Restart/lease recovery, retries, disabled runs and duplicate prevention pass MongoDB integration tests. |
| Role navigation | Student campus exposes directory/notices/calendar/knowledge, excluding Accounts and Automation; faculty has request controls; admin has management controls. Direct unauthorized API calls are covered by role-matrix tests. |

Server request logs confirmed real HTTP requests, including login/refresh 200, directory PUT 200, campus record POST 201, academic generate/publish 200, conflict PATCH 409 and missing-provider POST 503. MongoDB integration tests verify persistence, publication snapshot isolation, concurrent revision rejection, canonical-user references, source filtering before the provider, notification ownership and worker idempotency.

## Corrections from verification

- Removed fake password-reset/recovery success and invented support locations; recovery now states what is unavailable.
- Replaced canned JSR/account operations and preview login with real API behavior.
- Corrected calendar/reminder date submission, stale navigation text and false operational/compliance claims.
- Kept the original landing visuals; labelled showcase metrics and scenarios as illustrative.
- Limited Lenis smooth scrolling to the landing page after it interfered with portal interactions.
- Logout errors are surfaced, allowing server revocation to be retried.
- Added fresh database readiness probe, sanitized database/server errors, random development signing keys and production key enforcement.

## Limits and external blockers

Production MongoDB credentials, persistent API/worker hosting and AI provider credentials have not been supplied. The user explicitly requested deployment configuration while supplying services later. Frontend deployment can be verified separately; production login, timetable persistence and AI generation cannot be truthfully certified yet. No backend production URL exists in this task.

Voice is implemented with browser permission/unsupported states, but microphone/audio recognition was not exercised. Provider HTTP contracts and role-filtered retrieval pass automated tests using injected responses; no paid or real provider call was made. There is no standalone browser-test runner in this repository; browser verification above used the actual application through browser automation. Docker is unavailable locally; the CI pipeline includes a Linux container build.

Known functional bounds: no holiday/substitution calendar, no recurring schedules, no uploaded-document/vector index, no autonomous AI write actions, no external delivery channels or self-service lost-password recovery. Record retrieval/history is bounded; see ARCHITECTURE.md. Password changes revoke refresh sessions; already-issued access tokens expire normally. These limitations must be disclosed in the demonstration.

## Release verification — 2026-10-27

- Re-ran the unchanged application: **192 passed, 1 skipped, 7 warnings in 11.44 seconds**. Frontend lint, explicit TypeScript check and production build passed. The same large-bundle warning remains.
- PR #1 merged without rewriting history at `56290cecec60445d9cc6b661cebf7238c6bcdd11`. Both post-merge CI jobs passed, including real MongoDB integration tests, dependency audit and the Linux Docker build: [run 40439355048](https://github.com/NSHGAMER/Lumora/actions/runs/40439355048).
- Vercel production deployment `dpl_3pB5cSUBQJsug2dgu6V1o8Kj79xu` is Ready for that exact main commit. Public URL: https://lumora-rouge-zeta.vercel.app. `/login` returned HTTP 200 with the expected `index-C_zIHEij.js` and `index-BpUNMIvN.css` assets. The browser rendered the original landing design and protected the Command Center from unauthenticated access.
- Production login displays the explicit missing-API-configuration error. No browser console errors were recorded; Three.js emitted Clock deprecation warnings. Vercel project environment-variable inspection returned no variables, including no `VITE_API_BASE_URL`. No production API, Atlas connection, authenticated production dashboard or real AI response is certified.
- Staff browser login, directory access, refresh restoration and logout succeeded against the preserved local database. A protected route denied access after logout. Management login and automation history succeeded; Accounts remained unavailable to management. Automated integration tests cover all five canonical roles.
- No deployment-protection or authentication settings were changed. Production secrets and backend hosting remain external prerequisites; follow DEPLOYMENT.md, then repeat its production acceptance gate. The local professor demonstration remains available using DEMO_GUIDE.md.
