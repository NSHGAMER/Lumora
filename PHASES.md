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
[Phase 0: Foundation] ──────────────────────────► (COMPLETED / ACTIVE)
        │
        ▼
[Phase 1: Public Experience & Legal / UX] ──────► (IN PROGRESS)
        │
        ▼
[Phase 2: Authentication & User Lifecycle] ─────► (PLANNED)
        │
        ▼
[Phase 3: Core Campus Platform & Dashboards] ───► (PLANNED)
        │
        ▼
[Phase 4: FastAPI Backend Architecture] ────────► (PLANNED)
        │
        ▼
[Phase 5: MongoDB Atlas Data Layer] ────────────► (PLANNED)
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
**Status:** `In Progress`
- [x] Approved Hero section with interactive 3D and system stats (`Implemented`)
- [x] Problem & transformation section (`Implemented`)
- [x] JSR Core presentation section (`Implemented`)
- [x] Living Campus real-time spatial section (`Implemented`)
- [x] Operating system metrics counter (`Implemented`)
- [x] Interactive feature showcase and tabs (`Implemented`)
- [x] Institutional testimonials grid (`Implemented`)
- [x] Public navigation header and global footer (`Implemented`)
- [ ] **Legal & Compliance Suite:**
  - [ ] `/privacy` — Institutional data collection, user rights, data retention policy (`Documented`, `Planned`)
  - [ ] `/terms` — Acceptable use, institutional boundaries, AI system limits (`Documented`, `Planned`)
  - [ ] `/cookie-preferences` — Interactive modal/page for preference toggling & persistence (`Documented`, `Planned`)
- [ ] **Resilient UX Error & Status States:**
  - [ ] `404 Not Found` — Futuristic cosmic/spatial navigation recovery page (`Documented`, `Planned`)
  - [ ] `403 Forbidden` — Access denied with role escalation options (`Documented`, `Planned`)
  - [ ] `500 Server Error` — Graceful error containment without raw trace exposure (`Documented`, `Planned`)
  - [ ] `Maintenance Mode` — Planned institutional maintenance status board (`Documented`, `Planned`)
  - [ ] Reusable Skeleton Loading Suite (Cards, Tables, Dashboards, Lists, AI responses) (`Documented`, `Planned`)

---

### PHASE 2 — Authentication & User Lifecycle
**Status:** `Planned`
- [ ] **Registration Flow:**
  - [ ] Frontend form: Institutional ID / username, email, password, role selection.
  - [ ] Backend validation & password hashing (Argon2 / Bcrypt).
  - [ ] Immediate account activation (`is_active = true`).
  - [ ] **STRICT INVARIANT:** NO email verification, NO verification email, NO confirmation email, NO SMTP dependency, NO "verify your email" screen.
- [ ] **Login & Session Management:**
  - [ ] Email/ID + password with visibility toggle.
  - [ ] JWT access & refresh token exchange.
  - [ ] Session persistence & auto-refresh.
  - [ ] Safe logout and token revoking.
- [ ] **Role-Based Access Control (RBAC):**
  - [ ] Roles: `student`, `faculty`, `admin`, `management`, `staff`.
  - [ ] Client route guards and permission gates.
- [ ] **Account Settings:**
  - [ ] Profile overview and identity metadata.
  - [ ] Authenticated in-session password change.
  - [ ] Theme preference switcher (Dark / Light / System) with `localStorage` persistence.
- [ ] **Password Recovery (Planned):**
  - [ ] Documented feature without SMTP dependency; awaiting administrator-assisted or institutional reset integration.

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

### PHASE 4 — FastAPI Backend Architecture
**Status:** `Planned`
- [ ] FastAPI project structure (`api/`, `services/`, `repositories/`, `models/`, `core/`).
- [ ] Pydantic v2 data models and validation schemas.
- [ ] Authentication routers (`/api/v1/auth/*`).
- [ ] Academic management endpoints (`/api/v1/academics/*`).
- [ ] Campus facility endpoints (`/api/v1/campus/*`).
- [ ] Administrative & User management endpoints (`/api/v1/users/*`).
- [ ] Finance ledger endpoints (`/api/v1/finance/*`).
- [ ] Standardized JSON response envelope and global exception handlers.

---

### PHASE 5 — MongoDB Atlas Data Layer
**Status:** `Planned`
- [ ] MongoDB Atlas cluster provisioning and connection pooling.
- [ ] Database schema design and collection indexing:
  - `users`, `roles`, `courses`, `enrollments`, `schedules`, `facilities`, `ledgers`, `audit_logs`.
- [ ] Motor async repository implementations.
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
