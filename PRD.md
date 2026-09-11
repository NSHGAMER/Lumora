# PRD — Product Requirements Document

## 1. Product Identity
- **Product Name:** Lumora
- **Tagline / Definition:** AI-Powered Campus Operating System (Campus OS)
- **Core Intelligence:** JSR — The Intelligence
- **Target Audience:** Students, Faculty, Administrators, Management, Institutional Staff
- **System Classification:** Mission-critical Institutional Platform & Orchestration Hub

---

## 2. Executive Summary & Purpose
Higher education institutions and university campuses operate across dozens of fragmented, legacy, and disconnected systems: Student Information Systems (SIS), Learning Management Systems (LMS), attendance kiosks, fee collection gateways, department portals, and physical facility monitors.

**Lumora** is an intelligent campus operating system designed to unify academic, administrative, communication, automation, and AI-assisted institutional workflows into a single cohesive, high-performance, and futuristic control plane.

Lumora does not merely display dashboards; it orchestrates campus operations through **JSR — The Intelligence**, an autonomous AI co-pilot and multi-agent coordination system.

---

## 3. Core Product Areas

### 3.1 Public & Landing Experience
- **Hero Section:** Visionary introduction with interactive visual focal points and dynamic system status (LOCKED).
- **Living Campus:** Real-time spatial telemetry of campus facilities, energy, workstation occupancy, and building metrics (LOCKED).
- **JSR Core Presentation:** Explanation of the intelligence engine, agent networks, and autonomous workflows (LOCKED).
- **Problem & Solution Narrative:** Comparison of fragmented legacy ERPs versus unified campus OS architecture.
- **Metrics & Showcase:** Quantified institutional efficiencies and feature deep-dives.
- **Legal & Compliance Experience:**
  - `/privacy` — Institutional data collection, retention, privacy standards, and user rights.
  - `/terms` — Acceptable use policies, institutional service boundaries, AI limitations.
  - `/cookie-preferences` — Granular preference controls for cookies/local state with persistent saving.

### 3.2 Authentication & User Lifecycle (Phase 2)
- **Registration:**
  - Institutional registration with validation on username/student ID, email, role, and strong password.
  - **CRITICAL ARCHITECTURAL DIRECTIVE:** **NO email verification, NO verification email, NO confirmation email, NO SMTP dependency, NO "verify your email" screen, and NO activation tokens.**
  - Account is immediately active upon successful backend validation and database storage.
  - Built with clean separation so email communication/verification can be plugged in as an optional service in future phases without rewriting auth.
- **Login & Session Management:**
  - Login via email or institutional identifier + password.
  - Password visibility toggle, live input validation, intuitive loading feedback, and clear error messaging.
  - Stateless JWT access and refresh token pattern.
  - Secure session storage with auto-expiry handling.
- **Role-Based Access Control (RBAC):**
  - Granular permissions mapped to roles: `student`, `faculty`, `admin`, `management`, `staff`.
  - Permission checks enforced at route boundaries, UI components, and backend API endpoints.
- **Account Settings & Profile Management:**
  - Profile details, role designation, department affiliations.
  - In-session authenticated password change.
  - Theme preference persistence (Dark / Light / System).
  - Notification and telemetry preference toggles.
- **Password Recovery (Planned):**
  - Documented strictly as a planned feature.
  - **NO SMTP dependencies.** Future implementations will use secure authenticated in-person verification, administrative reset workflows, or separately approved institutional verification channels.

### 3.3 Core Campus Dashboards & Management (Phase 3)
- **Student Dashboard:** Course schedules, active assignments, GPA metrics, attendance records, quick JSR actions.
- **Faculty Dashboard:** Class rosters, grading queues, lecture schedules, student advisory tickets.
- **Administrator Dashboard:** Campus-wide telemetry, user directory, permission management, audit logs, resource consumption.
- **Academic Management:** Curriculum planning, course catalog, credits, workload scoring.
- **Timetable & Attendance:** Real-time class timings, room allocations, conflict detection, biometrics/geofence integration.
- **Announcements & Events:** Verified institutional broadcasting, event calendars, RSVP tracking.
- **Departments & Facilities:** Academic department directories, campus building occupancy, lab station booking.
- **Finance & Fee Clearance:** Real-time ledger of tuition, lab fees, pending dues, receipt generation, payment status.
- **Institutional Communication:** Official notices, direct escalations, support ticketing.

### 3.4 JSR — The Intelligence & AI Agent Ecosystem (Phases 6–9)
**JSR is NOT a basic chatbot.** JSR is an intelligent orchestration engine capable of:
1. **Natural-Language Understanding (NLU):** Parsing complex, multi-part campus queries.
2. **Intent Recognition & Extraction:** Resolving user role, target entities, action types, and parameters.
3. **Institutional Information Retrieval:** Querying internal knowledge graphs, vector embeddings, and verified SQL/NoSQL databases.
4. **Agent Selection & Delegation:** Routing sub-tasks to specialized domain agents:
   - *Academic Agent:* Syllabi, prerequisites, grades, assignment deadlines.
   - *Student Agent:* Schedule adjustments, extracurriculars, advising.
   - *Faculty Agent:* Grade submission, lecture hall requests, student queries.
   - *Finance Agent:* Dues, payment schedules, scholarship status.
   - *Communication Agent:* Dispatching notices, scheduling alerts.
   - *Analytics Agent:* Campus efficiency metrics, grade distributions, predictive dropouts.
   - *Administration Agent:* Role provisioning, facility lockouts, policy enforcement.
   - *Library Agent:* Digital repository search, physical book reserves.
   - *Automation Agent:* Triggering n8n webhooks and background jobs.
5. **Workflow Execution & API Invocation:** Executing approved write operations through secure backend APIs.
6. **n8n Orchestration:** Interfacing with n8n for multi-step external notifications, webhooks, and integrations.
7. **Communication & Voice Channels:** Supporting email (when explicitly configured), messaging bridges, and conversational AI voice interactions.
8. **Human Escalation:** Recognizing boundaries where human administrative approval or counseling is mandatory.
9. **Context & Audit Logging:** Maintaining stateful conversational context per session with full audit trails.
10. **Data Integrity Guarantee:** **Never expose fake institutional data as real data.** When data does not exist or backend endpoints are pending, Lumora states the actual status clearly.

#### Example JSR Interaction Flow:
- **User Prompt:** *"What is my pending fee and can I arrange a payment plan?"*
- **JSR Execution:**
  1. Understand intent: Query fee ledger + inquire about installment plan.
  2. Identify and authenticate user: Extract user session and verify permissions.
  3. Query Finance service/database: Retrieve actual fee balance and due date.
  4. Present verified answer clearly in UI with formal itemization.
  5. Check eligibility for installment plans based on institutional policy rules.
  6. Offer available actions (e.g., download breakdown, request payment plan approval).
  7. If human intervention is required, create an audited escalation ticket for the Finance Department and provide the user with the tracking ID.

---

## 4. UX & Resilience Standards

### 4.1 System Error & Status States
All error and system status states must be first-class Lumora experiences using the dark futuristic visual system:
- **404 Page Not Found:** Clear cosmic/spatial telemetry context explaining missing coordinates with quick return paths.
- **403 Access Forbidden:** Clear security clearance feedback explaining missing role authorization without leaking confidential data.
- **500 Internal Server Error:** High-tech error containment card providing retry actions and error reference IDs without exposing raw stack traces.
- **Maintenance Mode:** Operational pause status with status indicators and expected recovery time.
- **Skeleton Loading States:** High-fidelity animated skeletons for cards, tables, dashboards, lists, profile cards, and AI conversational responses. Blank screens during data fetching are strictly forbidden.

---

## 5. Non-Functional Requirements
1. **Security:** Zero client-side storage of master secrets or database credentials; bcrypt/argon2 password hashing; HTTP-only or secure bearer tokens; strict input sanitization.
2. **Performance:** Initial render < 1.5s; smooth 60fps animations; lazy loading of non-critical heavy modules (Three.js 3D models, charts).
3. **Accessibility & Usability:** WCAG 2.1 AA standards; keyboard navigable command palette (`Cmd+K`); high contrast typography.
4. **Modularity:** Monolithic UI components are prohibited; single-responsibility modules across services and frontend components.
