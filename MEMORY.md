# MEMORY — Persistent Project Memory & State

## A. Project Identity
- **Product Name:** Lumora
- **Classification:** AI-Powered Campus Operating System (Campus OS)
- **Core Intelligence:** JSR — The Intelligence
- **Repository:** `d:\Projects From PC\Lumora`

---

## B. Completed Work (Chronological Milestones)
1. **Initial Scaffold & Core UI Prototype:** Built React 19 + TypeScript + Vite 8 architecture with Tailwind CSS v4 styling.
2. **Approved Landing Experience Baseline:**
   - Interactive Hero section with live telemetry and 3D spatial canvas (`HeroSection.tsx`).
   - Problem & solution comparative breakdown (`ProblemSection.tsx`).
   - JSR core neural network presentation (`JSRCoreSection.tsx`).
   - Real-time Living Campus telemetry dashboard (`LivingCampusSection.tsx`).
   - Operating system performance metrics (`OperatingSystemMetrics.tsx`).
   - Interactive feature tab showcase (`FeatureShowcase.tsx`).
   - Institutional testimonials grid (`TestimonialGrid.tsx`).
   - Floating glass navigation bar with role switcher and quick actions (`Navbar.tsx`).
   - Global footer with status heartbeat (`Footer.tsx`).
3. **Core Interactive Views:**
   - Role-based Command Center (`CommandCenterView.tsx`).
   - Academic schedules and workload scoring view (`AcademicsView.tsx`).
   - Spatial campus facility grid view (`CampusGridView.tsx`).
   - JSR AI Co-Pilot Assistant modal dialog (`JSRAssistantModal.tsx`).
   - System-wide Command Palette (`Cmd+K`) (`CommandPalette.tsx`).
   - Ambient Cursor Glow effect (`CursorGlow.tsx`).
4. **Tooling & Smooth Scrolling:**
   - Configured Lenis smooth scrolling for luxury scrolling dynamics.
   - Configured `oxlint` for lightning-fast linting and code quality validation.
5. **Project Governance & Foundation Update (V2):**
   - Verified repository structure, dependencies, and build pipeline (`npm run build` succeeds with code 0).
   - Created comprehensive project governance specification:
     - `PRD.md`: Full product requirements, user personas, JSR capabilities, UX & legal requirements.
     - `ARCHITECTURE.md`: High-level distributed architecture, frontend/backend separation, data flows, auth architecture.
     - `RULES.md`: 30 strict engineering rules, security rules, and authentication invariants.
     - `PHASES.md`: 11-phase development roadmap (Phases 0–10) with exact status tracking.
     - `DESIGN.md`: Locked visual language, token architecture, and typography standards.
     - `MEMORY.md`: Persistent project state, decisions, and task tracker.
6. **Phase 1 Public Experience & UX Resilience Implementation:**
   - **Legal Compliance Suite:**
     - `/privacy` (`PrivacyPolicyView.tsx`) with institutional data handling, JSR data policies, and disclaimers.
     - `/terms` (`TermsOfServiceView.tsx`) with acceptable use, AI verification requirements, and liability boundaries.
     - `/cookie-preferences` (`CookiePreferencesView.tsx`) with essential/preferences/analytics category toggles and `localStorage` persistence.
     - Reusable preference hook `useCookiePreferences.ts`.
   - **Resilient UX Error & Status Suite:**
     - `/404` (`Error404View.tsx`) "Signal Lost" with spatial telemetry diagnostics and navigation back to campus hub.
     - `/403` (`Error403View.tsx`) "Access Restricted" with RBAC enforcement notice without leaking authorization internals.
     - `/500` (`Error500View.tsx`) "System Fault" with safe fault isolation and zero credential/stack trace leaks.
     - `/maintenance` (`MaintenanceView.tsx`) Institutional maintenance status screen with operational window placeholder and node status check.
     - React `ErrorBoundary.tsx` wrapping the application viewport to catch unexpected rendering anomalies and present the 500 state safely.
   - **Reusable Skeleton Loading Suite (`src/components/ui/skeleton/`):**
     - Base `Skeleton`, `SkeletonText`, `SkeletonAvatar`, `SkeletonCard`, `SkeletonTable`, `SkeletonList`, `SkeletonDashboard`, `SkeletonProfile`, `SkeletonAIResponse`, `SkeletonCampus`.
   - **Routing & Navigation Architecture:**
     - History API synchronization (`window.location.pathname`, `pushState`, `popstate` event handling).
     - Automatic 404 fallback for any unrecognized routes.
     - Integrated legal and maintenance routes into `Footer.tsx` and `CommandPalette.tsx` without changing locked landing UI.

7. **Phase 2A Authentication UI & Lifecycle Foundation:**
   - **Frontend Authentication Architecture (`src/auth/`):**
     - `AuthContext.tsx` & `useAuth.ts`: State management for authenticated user, status, and theme.
     - `authStorage.ts`: Secure local persistence for theme tokens and isolated demo sessions. Zero storage of passwords or fake production JWTs.
     - `ProtectedRoute.tsx`: Reusable route wrapper enforcing session clearance and role matching with fallback challenge card.
     - Theme Controller: Supports `dark` (primary default), `light`, and `system` modes without altering locked landing visual baseline.
   - **Authentication Views (`src/components/auth/`):**
     - `/login` (`LoginView.tsx`): Email/ID + password with visibility toggle, remember session, and quick demo profile preview.
     - `/register` (`RegisterView.tsx`): Full name, institutional email, password strength meter, student/faculty role selector, and explicit immediate activation badge. The institutional identifier required for real registration remains a Phase 2B backend contract.
     - **CRITICAL INVARIANTS PRESERVED:** NO email verification, NO verification email, NO confirmation email, NO SMTP dependency, NO "verify your email" screen.
     - `/forgot-password` (`ForgotPasswordView.tsx`): Institutional recovery protocol with zero SMTP dependency or fake email sends.
     - `/reset-password` (`ResetPasswordView.tsx`): Secure credential update UI with checklist criteria and immediate login routing.
     - `/account` (`AccountSettingsView.tsx`): Profile metadata, in-session password change, active sessions indicator, theme switcher, and sign out.
   - **Navigation Integration:**
     - Integrated account console and sign-in shortcuts into Navbar role dropdown and Command Palette (`Cmd+K`).
8. **Phase 2B.1 FastAPI Backend Foundation:**
   - Modular backend architecture established in `backend/app/` (`api/v1/`, `core/`, `schemas/`, `services/`, `repositories/`, `dependencies/`).
   - Centralized Pydantic Settings configuration with environment segregation (`development`, `testing`, `production`), zero hardcoded secrets, and safe `backend/.env.example` template.
   - Strict explicit CORS allowlist with automated validation rejecting wildcards (`*`) in production.
   - Standardized versioned API mounting at `/api/v1`.
   - Health check endpoint (`GET /api/v1/health`) returning operational status, version, and environment telemetry.
   - Root API info endpoint (`GET /api/v1`) returning public system identity and documentation routing.
   - Structured error handling foundation adhering to RULE 11 (`RESOURCE_NOT_FOUND`, `VALIDATION_ERROR`, `INTERNAL_SERVER_ERROR`).
   - Dependency management via `backend/requirements.txt` (FastAPI, Pydantic, Uvicorn, Pytest, HTTPX).
   - Test suite in `backend/tests/` verified with 13 passing pytest tests (100% pass rate).
9. **Phase 2B.2 MongoDB Atlas Persistence + Data Foundation:**
   - Dedicated persistence layer implemented using official modern async MongoDB driver (`pymongo.AsyncMongoClient`).
   - Single application-scoped connection pool lifecycle (`db_manager`) with startup index verification and clean shutdown.
   - Centralized configuration with `MONGODB_URI`, `MONGODB_DATABASE`, timeouts, and connection pool sizing via environment variables.
   - Truthful health reporting in `GET /api/v1/health` distinguishing `connected`, `unconfigured` (development-safe fallback), and `disconnected`.
   - Users collection contract established with canonical 5-role model (`student`, `faculty`, `admin`, `management`, `staff`), deterministic normalization for email and institutional ID, and strict exclusion of `password_hash` from client-facing schemas (`UserResponse`).
   - Idempotent index creation on startup with stable names (`idx_users_normalized_email_unique`, `idx_users_institutional_id_unique`, `idx_users_role`, `idx_users_created_at`) plus session collection blueprint.
   - Pure persistence `UserRepository` abstraction (`get_by_id`, `get_by_email`, `get_by_institutional_id`, `get_by_identifier`, `create_user`, `update_last_login`, `count`) injected via dependencies.
   - Full test coverage with 28 tests passing (100% pass rate) without requiring live production Atlas credentials.
10. **Usability + Accessibility Refinement Pass (19 Heuristic Findings):**
    - Executed minimal, evidence-based usability and accessibility refinements across frontend UI without altering locked visual identity.
    - Elevated heading contrast in `ProblemSection.tsx` via updated `.text-gradient` stops (contrast ratio > 9:1 against background).
    - Upgraded 11px body/supporting text to readable 12px `text-xs` across forms, cards, and informational banners while preserving technical micro-badges.
    - Replaced deceptive runtime kernel sync label in `JSRCoreSection.tsx` with static capability descriptor `NEURAL ARCHITECTURE PIPELINE` and accessible status.
    - Differentiated static technical specifications from interactive navigation in `Footer.tsx`, added visible keyboard focus states, aligned bottom bar, and set `role="status"` on system nodes badge.
    - Wrapped hero keyboard shortcut hint into an accessible, properly sized interactive control with semantic `<kbd>`.
    - Added `aria-current="page"` and keyboard focus visible rings across `Navbar.tsx` and modal dialogs (`CommandPalette.tsx`, `JSRAssistantModal.tsx`).
    - Aligned capability card footers in `JSRCoreSection.tsx` and `GlassCard.tsx` using `mt-auto` to ensure consistent visual rhythm.
    - Strengthened secondary CTA affordance (`variant="glow"`) in `MagneticButton.tsx` and marked decorative icons `aria-hidden="true"`.
    - Preserved locked visual baseline, 3D Canvas, and header composition without touching backend or auth.
    - Verified with oxlint (0 errors, 0 warnings), npm run build (built cleanly in 3.67s), pytest (28 tests passing, 100%), and git diff --check (clean).
11. **Phase 2B.3-A Authentication Contracts + Password Security Foundation:**
    - Established dedicated password security foundation in `backend/app/core/security.py` using Argon2id (`argon2-cffi`) with constant-time verification, rehash checks, and SHA-256 token hashing (`hash_token`).
    - Created centralized password policy contract (`PASSWORD_MIN_LENGTH=8`, `PASSWORD_MAX_LENGTH=128`, rejection of empty/whitespace).
    - Designed typed authentication request contracts in `backend/app/schemas/auth.py` (`RegisterRequest`, `LoginRequest`, `RefreshTokenRequest`, `TokenPayload`, `AuthResponse`).
    - Enforced strict credential isolation: `password_hash`, `token_hash`, and plaintext passwords are never included in API responses (`UserResponse`, `SessionResponse`, `AuthResponse`).
    - Defined session data contracts in `backend/app/schemas/session.py` (`SessionDocument`, `SessionCreateInternal`, `SessionResponse`) persisting only SHA-256 token fingerprints.
    - Implemented pure persistence `SessionRepository` abstraction in `backend/app/repositories/session_repository.py` backed by MongoDB `sessions` collection.
    - Configured centralized token security settings in `backend/app/core/config.py` (`jwt_secret_key`, `jwt_algorithm`, `jwt_access_token_expire_minutes`, `jwt_refresh_token_expire_days`, `jwt_issuer`, `jwt_audience`) with automated production validation rejecting default/placeholder secrets.
    - Updated `backend/.env.example` with safe, placeholder-only configuration templates.
    - Created comprehensive test suite in `backend/tests/test_security.py` with 59 passing unit/contract tests (100% pass rate).

12. **Phase 2B.3-B Registration Backend:**
    - Implemented real registration endpoint: `POST /api/v1/auth/register` returning HTTP 201 Created and safe `UserResponse`.
    - Enforced centralized role policy `PUBLIC_REGISTRATION_ROLES = {"student", "faculty"}`; privileged roles (`admin`, `management`, `staff`) return HTTP 403 Forbidden.
    - Built dedicated `RegistrationService` coordinating duplicate checks, Argon2id hashing, user construction, persistence, and error handling (Route -> Service -> Repository -> MongoDB).
    - Enforced deterministic identifier and email normalization before duplicate lookup and persistence.
    - Handled proactive duplicates and concurrent MongoDB `DuplicateKeyError` races returning clean HTTP 409 Conflict without leaking database internals.
    - Maintained core invariant: account is immediately active (`is_active=True`, `last_login_at=None`) with zero SMTP, zero verification emails, and zero tokens issued at registration.
    - Created comprehensive test suite in `backend/tests/test_registration.py` with 77 total passing backend tests (100% pass rate).

13. **Phase 2B.3-C Login, Sessions, JWT & Refresh Tokens:**
    - Implemented `POST /api/v1/auth/login` returning HTTP 200 OK with access JWT and setting a secure HttpOnly refresh cookie.
    - Implemented dedicated `AuthService` handling dual-mode lookup (institutional ID or email with deterministic normalization), Argon2id verification, active state check, access JWT creation, cryptographically secure refresh token generation, session persistence, and `last_login_at` timestamp updates.
    - Enforced generic authentication failure message (`HTTP 401 Unauthorized: "Invalid institutional credentials"`) to strictly prevent user enumeration.
    - Generated short-lived signed JWT access tokens adhering to the "Minimum Necessary Claims" principle: contains exactly (`sub`, `role`, `iss`, `aud`, `exp`, `iat`). `role` is retained for downstream stateless RBAC checks without a database lookup; `institutional_id` was removed as profile metadata delivered via `UserResponse`. Strictly excludes sensitive data, credentials, and database internals.
    - Stored strictly SHA-256 digests (`token_hash`) in MongoDB `sessions` collection via `SessionRepository`; raw refresh tokens are never persisted or returned in JSON.
    - Delivered raw refresh token via secure `HttpOnly` cookie (`SameSite=lax`, `Path=/api/v1/auth`, `Secure=settings.is_production`).
    - Supported multi-device sessions without preemptively invalidating concurrent logins.
    - Created comprehensive test suite in `backend/tests/test_login.py` (91 total passing backend tests, 1 skipped).

10. **Phase 2B.3-D Refresh Token Rotation, Session Revocation & Logout Implementation:**
    - Implemented `POST /api/v1/auth/refresh` endpoint obtaining the refresh token primarily via the HttpOnly `lumora_refresh_token` cookie (with body fallback for non-browser clients).
    - Designed atomic rotation via `SessionRepository.consume_active_session` (`find_one_and_update` with `revoked_at: None` and `expires_at > now`), preventing race conditions and ensuring that concurrent refresh attempts on the same token cannot both succeed.
    - Built single-use rotation: the consumed session document remains permanently revoked with timestamp for auditing, while a brand-new session document is persisted storing the SHA-256 digest of the new cryptographically secure random token.
    - Handled token reuse gracefully: previously revoked or expired tokens return generic `HTTP 401 Unauthorized: "Invalid or expired refresh token"`, protecting internal session states.
    - Maintained invariant: `last_login_at` is left unchanged on refresh and logout (only updated during initial credential login).
    - Preserved exact minimal JWT claim set (`sub`, `role`, `iss`, `aud`, `exp`, `iat`), excluding profile and sensitive fields.
    - Implemented `POST /api/v1/auth/logout` revoking the specific session identified by the refresh token and safely clearing the `lumora_refresh_token` cookie with matching security parameters (`Path=/api/v1/auth`, `SameSite=lax`, `Secure=settings.is_production`, `HttpOnly=True`).
    - Safe and idempotent logout: missing, invalid, or already revoked cookies succeed safely without leaking database details.
    - Multi-device session isolation: refreshing or logging out one session has zero impact on active sessions of the same user on other devices.
    - Verified zero frontend modifications (`src/*` untouched).
    - Comprehensive test suite in `backend/tests/test_refresh_logout.py` (108 total passing backend tests, 1 skipped).

---

## C. Current Phase
- **Phase 0 — Foundation:** `Completed` (`Implemented` & `Tested`)
- **Phase 1 — Public Experience & Resilience:** `Completed` (`Implemented` & `Tested`)
- **Phase 2A — Authentication UI & Lifecycle Foundation:** `Completed` (`Implemented` & `Tested`)
- **Phase 2B.1 — FastAPI Backend Foundation:** `Completed` (`Implemented` & `Tested`)
- **Phase 2B.2 — MongoDB Atlas Persistence Layer:** `Completed` (`Implemented` & `Tested`)
- **Phase 2B.3 — Real Authentication & JWT Security:** `In Progress`
  - **Phase 2B.3-A — Authentication Contracts + Password Security Foundation:** `Completed` (`Implemented` & `Tested`)
  - **Phase 2B.3-B — Registration Backend:** `Completed` (`Implemented` & `Tested`)
  - **Phase 2B.3-C — Login, Sessions, JWT & Refresh Tokens:** `Completed` (`Implemented` & `Tested`)
  - **Phase 2B.3-D — Refresh Token Rotation, Session Revocation, Logout:** `Completed` (`Implemented` & `Tested`)
  - **Phase 2B.3-E — RBAC & Protected Endpoints (/auth/me):** `Planned` (Next Milestone)
- **Phase 2B.4 — Frontend Auth Integration:** `Planned`

---

## D. Current Active File
- `backend/app/api/v1/endpoints/auth.py`

---

## E. Last Completed Task
- Completed Phase 2B.3-D: Refresh Token Rotation, Session Revocation & Logout. Implemented `POST /api/v1/auth/refresh` and `POST /api/v1/auth/logout`, atomic session consumption via `SessionRepository.consume_active_session`, single-use rotation, reuse detection, idempotent logout, cookie clearing, multi-device safety, and 108 passing backend tests (1 skipped). Zero frontend code touched.

---

## F. Next Task
- Phase 2B.3-E — RBAC & Protected Endpoints:
  - Implement `GET /api/v1/auth/me` returning the authenticated user profile.
  - Enforce backend role-based access control (RBAC) middleware for canonical roles (`student`, `faculty`, `admin`, `management`, `staff`).




---

## G. Important Architectural & Design Decisions
1. **Approved UI is Locked:** The existing Lumora visual language, navbar, hero section, living campus section, color system, typography, and dark futuristic identity are locked. New components must adhere to this design language.
2. **Authentication Invariant — No Email Verification:** Email verification is explicitly disabled. There is NO verification email, NO confirmation email, NO SMTP dependency, NO "verify your email" screen, and NO activation tokens. Registration immediately activates the account upon backend validation.
3. **Authentication Invariant — Extensibility:** Email is stored as a profile field. Email verification/notifications can be plugged in later as an optional microservice without rewriting the core auth pipeline.
4. **Password Recovery Invariant — No Silent SMTP:** Password recovery is documented as a planned feature. It will not depend silently on SMTP; future implementations will evaluate secure in-app authenticated password change, administrator-assisted reset, or university SSO/SAML recovery.
5. **Data Integrity Guarantee:** Never expose fabricated institutional data as real data. When backend services or endpoints are not yet active, the interface must honestly state their pending status.
6. **Zero Client Secrets:** Protected database credentials, signing keys, and external service tokens must never exist in frontend code.
7. **Canonical Role Model:** Lumora recognizes `student`, `faculty`, `admin`, `management`, and `staff`. The backend maps these roles to explicit permissions and remains the authorization authority.
8. **Institutional Identifier Contract:** Real registration requires a unique, backend-validated institutional identifier alongside the institutional email. The identifier is accepted for login and must never be fabricated by the client.
9. **Authentication Session Contract:** Real authentication includes register, login, refresh, current-user (`/me`), and logout endpoints. Refresh tokens are HTTP-only and logout revokes the active refresh session.

---

## H. Known Issues & Technical Debt
1. **Bundle Size Warning:** Vite build reports `dist/assets/index-*.js` is ~1.34 MB (>500 kB limit) due to bundling `@react-three/fiber`, `@react-three/drei`, `three`, and `framer-motion` in a single monolithic bundle.
   - *Planned Resolution:* Introduce dynamic code-splitting (`React.lazy` / `import()`) for 3D canvas and secondary view routes during Phase 10 performance optimization.

---

## I. Deployment Status
- **Local Dev Server:** Operational via `npm run dev` (Vite 8).
- **Static Production Bundle:** Verified (`dist/` built successfully in 4.88s).
- **Target Frontend Host:** Vercel.
- **Target Backend Host:** Modular containerized FastAPI deployment (Planned).
