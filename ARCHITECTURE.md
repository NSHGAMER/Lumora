# Lumora implemented architecture

This document describes the current implementation. Historical roadmap items in PRD/PHASES are not evidence of delivered functionality. See VERIFICATION.md for execution evidence and deployment blockers.

## Boundaries

React/Vite UI → central typed HTTP client → FastAPI authentication/authorization → domain services/repositories → MongoDB.

Canonical `users` and `sessions` remain the identity authority. Access JWTs live only in JavaScript memory; refresh tokens rotate in HttpOnly cookies and are stored as hashes. Directory profiles reference existing user IDs. Public registration is student-only; admin provisioning creates other roles. MongoDB indexes enforce unique identities. CORS and auth-origin validation use explicit origins. Rate limiting is process-local; production ingress must add shared abuse controls when scaling replicas.

## Academic integration

The supplied nested timetable ZIP was reviewed, including its standalone backend and greedy scheduler. Its sample identities, demo headers, module-state database and independent frontend were not imported. Scheduling concepts were adapted to Lumora's own users and MongoDB repositories.

`timetable_plans` stores one campus aggregate with catalog, revision, draft, immutable published snapshot, change-request history and outbox. Optimistic compare-and-replace prevents concurrent administrative overwrites. Every manual move, generation result and publication passes shared class/faculty/room conflict checks. Labs consume consecutive periods and cannot cross gaps. Weekly loads, availability, room type and complete allocations are checked. A bounded greedy search reports failure honestly; it is not an optimality or mathematical infeasibility proof.

Students see only published sessions for their enrollments; faculty see their own assigned published sessions. Admin/management edit drafts and publish. Other roles cannot mutate academic records. Catalog saves clear drafts but preserve published snapshots. Faculty requests are checked against assigned published sessions; approval changes a draft and requires explicit publication.

## Campus records and JSR

`campus_records` holds role-filtered notices/events/approved plain-text documents. `notifications` are recipient-owned. Directory editing reuses the existing directory service. Dashboard summaries count actual permitted records.

JSR pipeline: authenticated user → simple intent routing → role-filtered published timetable/directory/records → bounded source context → configurable HTTPS chat-completions adapter → schema/citation-ID validation → answer and source excerpts → audit metadata. No arbitrary tools, queries or shell execution. Conversation is bounded, no provider secrets reach the browser, and no complete question text is persisted in audit logs. Source text is treated as untrusted data. Missing context returns an explicit nongenerated clarification; missing AI credentials fail with 503. Tests inject a provider only at the dependency boundary.

Retrieval is bounded keyword ranking (latest 100 permitted records, top five matches; faculty directory first 30). It is not a vector search engine. Uploaded PDFs, long-term chat history and autonomous write actions are not implemented. Provider outputs can still be semantically mistaken even when source IDs are valid.

## Durable custom automation

API writes store an outbox event atomically with their source document. A separate Python worker dispatches events to validated workflow definitions and persists `workflow_runs`. Scheduled definitions have a single timezone-aware delivery instant; recurrence is not implemented. Stable workflow/event IDs prevent duplicate runs. Atomic leased claims, fenced completion, 20-second execution timeout, bounded exponential retry and expired-lease recovery support restarts and multiple workers. Recipient notification IDs are deterministic, making retries idempotent. Only the registered `notify` action exists.

The worker is a persistent supervised process or an externally scheduled `--once` command; it is never an in-memory scheduler attached to a Vercel function. Admin/management can inspect history, heartbeat and enable/disable definitions. A disabled run is cancelled when claimed; already-delivered notifications are not recalled. Retain run IDs while source events may be replayed. Maximums currently include 200 workflows, 500 timetable requests and 10,000 recipients per run; operators must monitor these bounds. Workflow completion/failure is visible in history.

## Deployment

Vercel serves Vite's `dist`. A persistent backend host runs the API and worker using the same database. `compose.yaml`, `backend/Dockerfile`, pinned dependencies and environment templates are provided. `/api/v1/ready` performs a current database ping. Production requires stable JWT secrets, HTTPS, correct CORS/cookies, database backups, ingress abuse limits and verified worker monitoring. See DEPLOYMENT.md.
