# PHASES — Development Roadmap & Milestone Tracker

This document outlines the sequential development roadmap for **Lumora — AI-Powered Campus Operating System**.
Phases are executed systematically. Future phases must not be implemented prematurely unless explicitly instructed.

### Status Definitions
- **Implemented:** Code is written, integrated, and functional in the codebase.
- **Tested:** Code has verified automated tests or manual test passes with zero regressions.
- **Deployed:** Code is deployed to a live staging/production environment.
- **Planned:** Architecture and design are established; ready for implementation in its designated phase.
- **Documented:** Fully specified in governance docs (`PRD.md`, `ARCHITECTURE.md`, `RULES.md`).

---

## Roadmap Overview

```
[Phase 0: Foundation] ──────────────────────────► (COMPLETED / IMPLEMENTED)
        │
        ▼
[Phase 1: Public Experience & Legal / UX] ──────► (COMPLETED / IMPLEMENTED & TESTED)
        │
        ▼
[Phase 2A: Authentication UI & Lifecycle Foundation] ► (COMPLETED / IMPLEMENTED & TESTED)
        │
        ▼
[Phase 2B.1: FastAPI Backend Foundation] ──────► (COMPLETED / IMPLEMENTED & TESTED)
        │
        ▼
[Phase 2B.2: MongoDB Atlas Persistence Layer] ──► (PLANNED)
        │
        ▼
[Phase 2B.3: Real Authentication & JWT Security] ► (PLANNED)
        │
        ▼
[Phase 2B.4: Frontend Auth Integration] ────────► (PLANNED)
        │
        ▼
[Phase 3: Core Campus Platform & Dashboards] ───► (PLANNED)
        │
        ▼
[Phase 4: Backend Domain API Expansion] ─────────► (PLANNED)
        │
        ▼
[Phase 5: MongoDB Domain Data Layer] ────────────► (PLANNED)
        │
        ▼
[Phase 6: JSR — The Intelligence Engine] ───────► (PLANNED)
        │
        ▼
[Phase 7: Multi-Agent AI Ecosystem] ────────────► (PLANNED)
        │
        ▼
[Phase 8: n8n Workflow Automation] ─────────────► (PLANNED)
        │
        ▼
[Phase 9: Advanced Intelligence & Voice AI] ────► (PLANNED)
        │
        ▼
[Phase 10: Production Hardening & Audits] ───────► (PLANNED)
```

---

## Phase Breakdown & Detailed Specifications

### PHASE 0 — Foundation
**Status:** `Implemented` & `Tested`
- [x] Modern project scaffold with Vite 8, React 19, TypeScript, Tailwind CSS v4.
- [x] Initial design tokens, glassmorphism utilities, and font definitions.
- [x] Lenis smooth scrolling integration.
- [x] Oxlint and TypeScript validation setup.
- [x] Comprehensive project governance files:
  - `PRD.md` (Product Requirements Document)
  - `ARCHITECTURE.md` (System Architecture)
  - `RULES.md` (Strict Engineering Rules)
  - `PHASES.md` (Roadmap & Milestone Tracker)
  - `DESIGN.md` (Visual Design Specification)
  - `MEMORY.md` (Persistent Project State)

---

### PHASE 1 — Public Experience & Resilience
**Status:** `Implemented` & `Tested`
- [x] Approved Hero section with interactive 3D and system stats (`Implemented`, `Tested`)
- [x] Problem & transformation section (`Implemented`, `Tested`)
- [x] JSR Core presentation section (`Implemented`, `Tested`)
- [x] Living Campus real-time spatial section (`Implemented`, `Tested`)
- [x] Operating system metrics counter (`Implemented`, `Tested`)
- [x] Interactive feature showcase and tabs (`Implemented`, `Tested`)
- [x] Institutional testimonials grid (`Implemented`, `Tested`)
- [x] Public navigation header and global footer (`Implemented`, `Tested`)
- [x] **Legal & Compliance Suite:**
  - [x] `/privacy` — Institutional data collection, user rights, data retention policy (`Implemented`, `Tested`)
  - [x] `/terms` — Acceptable use, institutional boundaries, AI system limits (`Implemented`, `Tested`)
  - [x] `/cookie-preferences` — Interactive modal/page for preference toggling & persistence (`Implemented`, `Tested`)
- [x] **Resilient UX Error & Status States:**
  - [x] `404 Not Found` — Futuristic cosmic/spatial navigation recovery page (`Implemented`, `Tested`)
  - [x] `403 Forbidden` — Access denied with role escalation options (`Implemented`, `Tested`)
  - [x] `500 Server Error` — Graceful error containment without raw trace exposure (`Implemented`, `Tested`)
  - [x] `Maintenance Mode` — Institutional maintenance status board (`Implemented`, `Tested`)
  - [x] Reusable Skeleton Loading Suite (Base, Text, Avatar, Card, Table, List, Dashboard, Profile, AIResponse, Campus) (`Implemented`, `Tested`)
  - [x] React Error Boundary catching render anomalies and rendering 500 state (`Implemented`, `Tested`)

---

### PHASE 2A — Authentication UI & Lifecycle Foundation
**Status:** `Implemented` & `Tested`
- [x] **Authentication Frontend Architecture:**
  - [x] Auth Context & State Provider (`AuthContext.tsx`, `useAuth.ts`, `authTypes.ts`).
  - [x] Secure storage abstraction with zero password leakage (`authStorage.ts`).
  - [x] Reusable Protected Route gate (`ProtectedRoute.tsx`) with role verification.
  - [x] Theme system integration (`dark`, `light`, `system`) with instant switching and persistence.
- [x] **Authentication Routes & Views:**
  - [x] `/login` (`LoginView.tsx`) — Email/ID + password with visibility toggle, remember session, validation, and demo profile preview.
  - [x] `/register` (`RegisterView.tsx`) — Full name, institutional email, password strength meter, role selector, and explicit immediate activation badge.
  - [x] **CRITICAL INVARIANT:** NO email verification, NO verification email, NO confirmation email, NO SMTP dependency, NO "verify your email" screen.
  - [x] `/forgot-password` (`ForgotPasswordView.tsx`) — Institutional recovery guidance with zero SMTP dependency or fake email sends.
  - [x] `/reset-password` (`ResetPasswordView.tsx`) — Secure credential update UI with criteria checklist and immediate login routing.
  - [x] `/account` (`AccountSettingsView.tsx`) — Profile metadata, in-session password change, active sessions indicator, theme switcher, and sign out.
  - [x] Integration with Navbar role dropdown and Command Palette (`Cmd+K`).

---

### PHASE 2B — FastAPI Backend Authentication & MongoDB Persistence

#### Phase 2B.1 — FastAPI Backend Foundation
**Status:** `Implemented` & `Tested`
- [x] Establish the foundational FastAPI application structure (`backend/app/` with `api/`, `core/`, `schemas/`, `services/`, `repositories/`, `dependencies/`), Pydantic Settings configuration, and modular architecture.
- [x] Lifespan async context manager for graceful process startup and shutdown logging.
- [x] Centralized environment configuration with environment segregation (`development`, `testing`, `production`).
- [x] Strict explicit CORS allowlist with automated validation rejecting wildcard origins (`*`) in production mode.
- [x] API versioning foundation mounted cleanly at `/api/v1`.
- [x] Service health endpoint: `GET /api/v1/health` returning structured health status, runtime environment, version, and component status.
- [x] Root API info endpoint: `GET /api/v1` returning public API identity, version, and documentation location.
- [x] Standardized error handling foundation (RULE 11 compliance) returning machine-readable codes and safe descriptions for 404, 422, and 500 exceptions.
- [x] Zero hardcoded secrets; safe `backend/.env.example` template with configuration placeholders.
- [x] Python dependency specification via `backend/requirements.txt`.
- [x] Comprehensive test suite in `backend/tests/` using pytest and TestClient (13 tests passing across health, info, config validation, production wildcard rejection, CORS headers, preflight options, and 404 structured envelope).

#### Phase 2B.2 — MongoDB Atlas Persistence Layer
**Status:** `Planned`
- [ ] MongoDB Atlas connection pooling plus initial `users` and `roles` collections, indexes, and Motor async repositories.
- [ ] Strict schema validation and document modeling.

#### Phase 2B.3 — Real Authentication & JWT Security
**Status:** `Planned`
- [ ] Authentication routers: `POST /api/v1/auth/register`, `POST /api/v1/auth/login`, `POST /api/v1/auth/refresh`, `GET /api/v1/auth/me`, and `POST /api/v1/auth/logout`.
- [ ] Password hashing via Argon2id / Bcrypt in Python backend.
- [ ] Cryptographically signed JWT access tokens (short-lived) and HTTP-only refresh tokens.
- [ ] Backend role-based authorization middleware (RBAC) for the canonical roles: `student`, `faculty`, `admin`, `management`, and `staff`.
- [ ] Require a unique institutional identifier at registration (student ID or institution-issued faculty/staff/management/administrator identifier), alongside full name, institutional email, role, and password; allow login by institutional identifier or email.
- [ ] Immediate account activation without email confirmation gate.
- [ ] Preserve authentication invariants: no Supabase Auth, SMTP, email verification, confirmation emails, activation tokens, fake production JWTs, or client-side password storage.

#### Phase 2B.4 — Frontend API Integration
**Status:** `Planned`
- [ ] Connect the existing frontend auth foundation to verified live endpoints without redesigning the locked landing page.

---

### PHASE 3 — Core Campus Platform & Dashboards
**Status:** `Planned`
- [ ] Unified Command Center dashboard with modular widgets.
- [ ] Role-tailored views:
  - [ ] Student Dashboard: Timetable, current workload, GPA, active tasks.
  - [ ] Faculty Dashboard: Course rosters, lecture schedules, grading queue.
  - [ ] Admin Dashboard: Campus telemetry, user directory, system health.
- [ ] Academic Management: Course catalog, syllabus repository, credit audits.
- [ ] Timetable Matrix: Real-time conflict-free class scheduling and room locator.
- [ ] Attendance Tracking: Session logging and analytics.
- [ ] Announcements & Event Broadcasting: Official university notices.
- [ ] Campus Facility Locator & Real-time Workstation Availability.

---

### PHASE 4 — Backend Domain API Expansion
**Status:** `Planned`
- [ ] Expand the Phase 2B FastAPI foundation with domain-specific Pydantic v2 schemas, services, repositories, and authorization policies.
- [ ] Academic management endpoints (`/api/v1/academics/*`).
- [ ] Campus facility endpoints (`/api/v1/campus/*`).
- [ ] Administrative & User management endpoints (`/api/v1/users/*`).
- [ ] Finance ledger endpoints (`/api/v1/finance/*`).
- [ ] Standardized JSON response envelope and global exception handlers.

---

### PHASE 5 — MongoDB Domain Data Layer
**Status:** `Planned`
- [ ] Extend the Phase 2B MongoDB foundation with domain collections and indexes: `courses`, `enrollments`, `schedules`, `facilities`, `ledgers`, and `audit_logs`.
- [ ] Implement Motor async repositories for domain data.
- [ ] Strict data validation rules and migration scripts.

---

### PHASE 6 — JSR — The Intelligence Engine
**Status:** `Planned`
- [ ] Intent recognition and entity extraction pipeline.
- [ ] Short-term and long-term conversation memory management.
- [ ] Knowledge graph & vector retrieval for institutional documentation.
- [ ] Tool calling registry linking JSR intents to backend API actions.
- [ ] Permission-aware prompt synthesis (no role leaks).
- [ ] Real-time streaming response generation.

---

### PHASE 7 — Multi-Agent AI Ecosystem
**Status:** `Planned`
- [ ] Specialized domain agents:
  - Academic Agent, Student Advisor Agent, Faculty Support Agent.
  - Finance Agent, Communication Agent, Campus Facility Agent.
  - Library Agent, System Administration Agent, Automation Agent.
- [ ] Inter-agent coordination and task delegation protocols.

---

### PHASE 8 — n8n Workflow Automation
**Status:** `Planned`
- [ ] n8n instance setup and webhook endpoint configuration.
- [ ] Event-driven triggers for campus actions (course drop/add, urgent notices).
- [ ] Scheduled background jobs (daily attendance summaries, sync jobs).
- [ ] Notification dispatching (in-app, push, and email when explicitly configured).
- [ ] Human escalation routing for unresolved student/faculty inquiries.

---

### PHASE 9 — Advanced Intelligence & Voice AI
**Status:** `Planned`
- [ ] Conversational Voice AI co-pilot for hands-free queries.
- [ ] Predictive academic analytics (workload balancing, risk detection).
- [ ] Autonomous campus energy and facility optimization.
- [ ] Collaborative multi-agent problem solving.

---

### PHASE 10 — Production Hardening & Deployment
**Status:** `Planned`
- [ ] Full end-to-end security audit and penetration testing.
- [ ] Bundle splitting, asset compression, and performance optimization.
- [ ] Comprehensive integration test suites (unit, e2e with Playwright).
- [ ] Continuous monitoring, error tracking (Sentry), and audit log archiving.
- [ ] Production deployment on Vercel (Frontend) and Cloud Container infrastructure (Backend).
- [ ] Final institutional demonstration and operator handoff.
