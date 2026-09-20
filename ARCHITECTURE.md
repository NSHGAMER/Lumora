# ARCHITECTURE — System Architecture & Technical Specification

## 1. High-Level Architecture Overview

Lumora is architected as a distributed, decoupled, high-performance Campus Operating System. The platform separates client presentation, API gateway & business logic, autonomous intelligence orchestration, asynchronous workflow automation, and persistent data storage.

```
┌───────────────────────────────────────────────────────────────┐
│                       USER (Web / Mobile)                     │
└───────────────────────────────┬───────────────────────────────┘
                                │ HTTPS / WSS
                                ▼
┌───────────────────────────────────────────────────────────────┐
│              REACT FRONTEND (Vite / TypeScript / CSS)         │
│  - Presentation Layer & Approved Lumora Design System         │
│  - Client State & Session Cache                               │
│  - Command Palette, 3D Spatial Canvas, JSR UI Modal           │
└───────────────────────────────┬───────────────────────────────┘
                                │ Typed API Client (Fetch / Axios)
                                ▼
┌───────────────────────────────────────────────────────────────┐
│                  FASTAPI BACKEND (Python)                     │
│  - RESTful API Routing & OpenAPI Documentation                │
│  - JWT Authentication & RBAC Authorization Middleware         │
│  - Input Validation & Schema Enforcement (Pydantic)           │
│  - Standardized Response Envelope & Global Error Handler      │
└───────────────┬───────────────────────────────┬───────────────┘
                │                               │
                ▼                               ▼
┌──────────────────────────────┐ ┌──────────────────────────────┐
│       SERVICE LAYER          │ │     JSR INTELLIGENCE ENGINE  │
│ - Academic Service           │ │ - Intent Recognition & NLU   │
│ - User & Account Service     │ │ - Context & Conversation Mem │
│ - Campus & Building Service  │ │ - Tool Calling & API Registry│
│ - Finance & Billing Service  │ │ - Multi-Agent Router         │
│ - Audit & Telemetry Service  │ │                              │
└──────────────┬───────────────┘ └──────────────┬───────────────┘
               │                                │
               ├────────────────┬───────────────┤
               ▼                ▼               ▼
┌─────────────────────────┐ ┌──────────────┐ ┌─────────────────┐
│     MONGODB ATLAS       │ │ n8n WORKFLOW │ │ SPECIALIZED AI  │
│ - Users & Roles         │ │ AUTOMATION   │ │ AGENTS          │
│ - Academic Curricula    │ │ - Webhooks   │ │ - Academic      │
│ - Buildings & Stations  │ │ - Schedules  │ │ - Student       │
│ - Fee Ledgers & Audits  │ │ - Alerts     │ │ - Faculty       │
│ - Knowledge Graph Data  │ │ - Integratns │ │ - Finance/Admin │
└─────────────────────────┘ └──────────────┘ └─────────────────┘
```

---

## 2. Technology Stack Breakdown

| Layer | Technology | Primary Responsibilities |
| :--- | :--- | :--- |
| **Frontend Framework** | React 19 & TypeScript | Component hierarchy, modular state, typed interfaces |
| **Build & Tooling** | Vite 8 + PostCSS | Ultra-fast HMR, optimized tree-shaking, production bundling |
| **Styling & Design** | Tailwind CSS v4 & Custom Utilities | Locked Lumora design system tokens, responsive layout |
| **Motion & Spatial** | Framer Motion & Three.js / R3F | Hardware-accelerated transitions, 3D Living Campus canvas |
| **Smooth Scrolling** | Lenis Scroll | Luxury physics-based scrolling experience across views |
| **Icons & Visuals** | Lucide React | Clean, scalable, lightweight iconography |
| **Backend Framework** | FastAPI (Python 3.11+) | High-throughput asynchronous REST API, auto-docs, Pydantic |
| **Database** | MongoDB Atlas (NoSQL) | Flexible document store, indexed search, geospatial/campus queries |
| **Workflow Engine** | n8n | Low-code/code workflow orchestration, scheduled jobs, triggers |
| **Authentication** | JWT (JSON Web Tokens) + Argon2/Bcrypt | Cryptographically signed access/refresh tokens, stateless auth |
| **Frontend Hosting** | Vercel | Global edge CDN, automated branch deployments, asset caching |
| **Backend Hosting** | Containerized (Docker / Cloud Run / VPS) | Modular container images, autoscaling, zero-downtime rolling deploys |

---

## 3. Frontend Architecture

### 3.1 Directory Structure
```
src/
├── assets/             # Static SVGs, images, ambient noise textures
├── components/
│   ├── 3d/             # Three.js canvas, campus spatial models, shaders
│   ├── academics/      # Course catalogs, schedule matrices, workload meters
│   ├── campus/         # Facility grid, building status, occupancy cards
│   ├── dashboard/      # Role-based Command Center, telemetry widgets
│   ├── jsr/            # JSR Assistant modal, chat bubbles, agent visualizers
│   ├── landing/        # Hero, Living Campus, Problem, Metrics, Showcase, Footer
│   ├── auth/           # Authentication routes and account settings views
│   ├── errors/         # Resilient error and maintenance views
│   ├── legal/          # Privacy, terms, and cookie-preference views
│   ├── navbar/         # Floating glass navigation, role selector, quick links
│   └── ui/             # Command palette, buttons, badges, modals, skeletons
├── auth/               # Auth context, storage abstraction, guards, and types
├── hooks/              # Reusable client hooks
├── types/              # TypeScript interface and type definitions
├── App.tsx             # Root container with view router and global providers
├── index.css           # Core theme variables, glass utilities, Tailwind imports
└── main.tsx            # DOM root mounting
```

### 3.2 State Management & View Transitions
- **View Routing:** Active view states (`home`, `command`, `academics`, `campus`, `legal`, etc.) are decoupled and driven by clean navigation handlers.
- **Client Caching:** Dynamic data queries are isolated in service hooks with explicit loading, empty, and error state transitions.
- **No Monoliths:** Large view containers are broken into sub-components representing discrete cards, metrics, and actionable widgets.

---

## 4. Backend & API Architecture (Phase 2B Foundation)

Phase 2B establishes the foundational FastAPI application, MongoDB Atlas persistence, and real authentication. Phase 4 extends this foundation with domain APIs; it does not recreate the application skeleton or authentication stack. Phase 5 extends the initial authentication data store with domain collections.

### 4.1 Modularity & Layered Pattern
The FastAPI application follows a strict 3-tier structure:
1. **API Routers (`api/v1/`):** Route definitions, HTTP verbs, path/query parameters, status codes, and request/response schema validation.
2. **Service Layer (`services/`):** Business logic, validation rules, transactional coordination, and agent tool execution.
3. **Data Access Layer (`repositories/`):** Direct database operations against MongoDB using Motor / PyMongo, handling indexes and projections.

### 4.2 API Security & Credential Isolation
- **No Client Credentials:** Database connection strings, JWT secret keys, and external service tokens reside exclusively in backend environment variables (`.env`).
- **CORS Policies:** Strict whitelist configured for approved client origins.
- **Rate Limiting:** IP-based and token-based rate limiting on sensitive endpoints (authentication, AI generation, command execution).

---

## 5. Authentication Architecture (Critical Specification)

### 5.1 Canonical Role Model

Lumora recognizes exactly these RBAC roles throughout its frontend contracts, backend authorization, and persisted user records: `student`, `faculty`, `admin`, `management`, and `staff`. Roles are not permissions by themselves; the backend maps them to explicit permissions and enforces those permissions at API boundaries.

### 5.2 Registration Flow (Phase 2B)
The registration pipeline is intentionally streamlined and devoid of external email blockers:

```
[User on Frontend]
        │ Enters full name, unique institutional identifier, email, password, role
        ▼
[Frontend Validation]
        │ Form integrity, password strength criteria, required fields
        ▼
[POST /api/v1/auth/register]
        │
        ▼
[FastAPI Backend Validation]
        │ Check existing user uniqueness, sanitize inputs
        ▼
[Password Hashing]
        │ Argon2id or Bcrypt with appropriate work factor
        ▼
[Create User in MongoDB]
        │ User record stored with `is_active: true`, role assigned
        ▼
[Account Immediately Active]
        │ Returns 201 Created with user info & initial JWT tokens
        ▼
[Immediate Login / Session Establishment]
        │ User lands directly in their role-tailored Dashboard
```

#### Mandatory Constraints:
- **NO email verification required.**
- **NO verification email sent.**
- **NO confirmation email sent.**
- **NO SMTP dependency.**
- **NO "verify your email" holding screen.**
- **NO email confirmation token required for account activation.**
- **NO external third-party email service required.**

*Architectural Note:* The data model includes the `email` attribute for identity and institutional correspondence, but account state is set to active immediately upon account creation. When institutional email notifications or verification features are introduced in future phases, they will plug into this service without altering core registration logic.

The institutional identifier is required at registration and is unique per user. It is the institution-issued student ID for students and the institution-issued faculty, staff, management, or administrator identifier for other roles. The backend normalizes and indexes it, and accepts it or the normalized institutional email as the login `identifier`. It must be issued or validated by the backend; the client must not fabricate it.

### 5.3 Login, Session, and Token Strategy
- **Endpoints:** `POST /api/v1/auth/login`, `POST /api/v1/auth/refresh`, `GET /api/v1/auth/me`, and `POST /api/v1/auth/logout`.
- **Request:** `{ identifier: string, password: string }`
- **Tokens Issued:**
  - **Access Token:** Short-lived JWT (15–30 minutes) carrying claims: `sub` (User ID), `role`, `permissions`.
  - **Refresh Token:** Long-lived token stored in HTTP-only, SameSite cookie or secure local vault.
- **Logout:** `POST /api/v1/auth/logout` invalidates the active refresh token and purges client session state.
- **Refresh:** `POST /api/v1/auth/refresh` validates and rotates the HTTP-only refresh token before issuing a renewed access token.
- **Current User:** `GET /api/v1/auth/me` returns the canonical authenticated profile, role, and permissions for session restoration and authorization-aware UI.

### 5.4 Password Recovery Strategy (Planned)
- **Status:** Planned feature.
- **Constraint:** **Zero dependency on SMTP.**
- **Approved Architectural Paths for Future Activation:**
  1. *Authenticated In-App Password Change:* Requires current active session + verified current password.
  2. *Administrator / Helpdesk Assisted Reset:* Institutional clearance verification with temporary single-use code issued by registrar.
  3. *Institutional SSO / SAML Delegation:* Handled upstream by university identity provider when configured.

---

## 6. JSR — The Intelligence & AI Agent Orchestration

### 6.1 Architectural Workflow
1. **User Input:** Sent via modal dialog or `Cmd+K` command palette.
2. **Context Enrichment:** User profile, role, current page, and recent history prepended to agent prompt.
3. **Intent Parsing:** LLM classifies query into action categories: Data Retrieval, Workflow Action, Advisory, or Clarification.
4. **Tool / Agent Selection:** Router delegates execution to domain agents (Academic, Finance, Administration, etc.).
5. **Permission Verification:** The engine ensures the requesting role has read/write clearance for the targeted entity.
6. **Execution & Synthesis:** Results returned in a structured JSON schema, formatted into luxury glass UI response cards.
7. **Audit Trail:** Every autonomous action is logged to the MongoDB audit collection.

---

## 7. Deployment & Infrastructure Strategy

- **Frontend:** Deployed on **Vercel** with automatic preview deployments on pull requests and edge routing.
- **Backend:** Packaged via Docker into a lightweight Python container, deployed to cloud infrastructure with zero hardcoded environment configs.
- **CI/CD Pipeline:** Automated linting (`oxlint`), type-checking (`tsc -b`), and build testing before merging.
