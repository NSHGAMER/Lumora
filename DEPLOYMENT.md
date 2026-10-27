# Deploying Lumora

The frontend and backend have different deployment lifecycles. Deploy the Vite frontend to the existing Vercel project. Run FastAPI and `app.worker` as separate processes on a persistent host with access to the same MongoDB database. A worker inside a Vercel request is not supported.

## Required configuration

| Variable | Where | Value / purpose |
|---|---|---|
| `VITE_API_BASE_URL` | Vercel build / root `.env.local` | API origin, without `/api/v1`, e.g. `https://api.your-campus.example`. Public; never a secret. |
| `LUMORA_ENV` | API and worker | `production` on the host |
| `MONGODB_URI` | API and worker secret store | Real Atlas URI with database user and network access allowed for the host |
| `MONGODB_DATABASE` | API and worker | Same production database name |
| `JWT_SECRET_KEY` | API secret store | Stable random value, at least 32 characters; use the same value across API replicas |
| `CORS_ORIGINS` | API | JSON list of exact frontend HTTPS origins; no wildcard |
| `REFRESH_COOKIE_SAMESITE` | API | `lax` for same-site domains; `none` for separate HTTPS sites |
| `AI_BASE_URL` | API | HTTPS provider base including version path; adapter appends `/chat/completions` |
| `AI_MODEL` | API | Model identifier supporting JSON response format |
| `AI_API_KEY` | API secret store | Provider key, server-only |
| `AI_TIMEOUT_SECONDS` | API | Optional, default 30, maximum 60 |

Generate the JWT key with a cryptographically secure generator and enter it directly into the host's secret settings. Never put server secrets in `VITE_*` variables, Git, screenshots, logs, or chat. API and worker read `backend/.env` only when launched from that directory; hosted processes should receive injected environment variables. Development without an explicit signing key uses an ephemeral random key, invalidated by restart.

## Backend host setup

1. Supply a host supporting a persistent Python 3.13 process or containers. Create an API service and a separate background worker service from the same commit.
2. Build `backend/Dockerfile` with `backend` as build context, or install `backend/requirements.lock` in a fresh virtual environment.
3. API command from `backend`: `python -m uvicorn app.main:app --host 0.0.0.0 --port 8000`. If the host assigns a port, pass that port explicitly in its start command. Configure a TLS reverse proxy / managed HTTPS ingress.
4. Worker command from `backend`: `python -m app.worker`. Enable process restart on failure. Alternatively a reliable external scheduler may invoke `python -m app.worker --once`; missed scheduled work is caught up on the next invocation.
5. Configure secrets above and Atlas network access restricted to the backend host. Use a dedicated database user with only required database privileges. Set backups and retention appropriate to the institution.
6. Readiness probe: `/api/v1/ready` must return HTTP 200 and `{"status":"ready"}` after a fresh database ping. `/api/v1/health` reports process/component status; a 200 there alone does not prove database readiness.
7. Run `python -m app.bootstrap_admin` interactively once from a trusted host console. It prompts for credentials and refuses an existing administrator. Use Campus → Accounts to provision faculty/management/staff thereafter. Public registration creates students only.
8. Confirm an advancing worker heartbeat in Campus → Automation. Stop/restart the worker and confirm queued work resumes with no duplicated recipient notification.

`compose.yaml` supplies API/worker containers for a server you control; it reads an ignored `backend/.env` and binds the API to loopback for a TLS proxy. Docker is not installed on the current Windows machine, so local image execution could not be verified here; CI includes a Linux Docker build. Never use the unauthenticated demo Mongo container for production.

## Vercel frontend

Existing project: `lumora`, Vite, repository root, build `npm run build`, output `dist`, Node 24. `vercel.json` preserves SPA navigation and excludes `/api` from the static fallback. Set `VITE_API_BASE_URL` after the backend HTTPS origin exists, then rebuild/redeploy because Vite embeds it at build time. Until then, campus operations show an explicit configuration error. Do not point the production bundle at localhost or a temporary demo database.

Use same-site custom domains (for example `campus.example.edu` and `api.example.edu`) when possible. Cross-site refresh cookies require `SameSite=None; Secure`, credentialed requests and exact CORS origins, but browser third-party-cookie restrictions may still prevent refresh. Verify login, reload, logout and refresh in the professor's actual browser. Do not disable cookie security or deployment protection to conceal a failure.

## JSR and external channels

The provider must accept chat-completions JSON requests and `response_format: {type: json_object}`. Test a question about an approved knowledge document and inspect cited source text. Missing credentials result in HTTP 503; there is no canned AI fallback. Routine tests inject a test provider only.

Email, SMS, WhatsApp and telephone delivery are not implemented or configured. In-app delivery is real. Password recovery is an honest institutional-support screen, not a simulated email/reset flow. Before enabling self-service recovery, implement and verify a delivery provider plus expiring, hashed, single-use reset tokens. Signed-in password changes work now.

## Production acceptance gate

After services are supplied: verify HTTPS readiness; bootstrap the owner; provision real users; configure catalog/enrollments; generate and publish; verify student/faculty views; save and reload a directory edit; publish a notice; verify exactly one notification per recipient; schedule a reminder; restart the worker; verify JSR citations and denied private sources; verify login/refresh/logout across frontend/backend origins. A successful frontend build does not satisfy this gate.

References: [Vite on Vercel](https://vercel.com/docs/frameworks/frontend/vite), [Docker environment configuration](https://docs.docker.com/compose/how-tos/environment-variables/set-environment-variables/), [GitHub service containers](https://docs.github.com/en/actions/tutorials/use-containerized-services/use-docker-service-containers).
