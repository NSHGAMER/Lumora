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

---

## C. Current Phase
- **Phase 0 — Foundation:** `Completed` (`Implemented` & `Tested`)
- **Phase 1 — Public Experience & Resilience:** `Completed` (`Implemented` & `Tested`)
- **Phase 2A — Authentication UI & Lifecycle Foundation:** `Completed` (`Implemented` & `Tested`)
- **Phase 2B — FastAPI Backend + MongoDB Persistence + Real Authentication:** `Planned` (Next Phase)

---

## D. Current Active File
- `src/App.tsx` (Wrapped in AuthProvider, routing all Phase 1 & 2A views)

---

## E. Last Completed Task
- Reconciled Phase 2B governance documentation: Phase 2B now owns the foundational FastAPI application, MongoDB Atlas authentication persistence, and real authentication contract; later phases extend domain APIs and data collections. No implementation code was changed.
- The prior implementation milestone remains Phase 2A: authentication UI routes, AuthContext abstraction, ProtectedRoute gate, theme switcher, and role preview. It was verified with `oxlint` (0 errors, 0 warnings) and `npm run build` (success in 944ms).

---

## F. Next Task
- Phase 2B — FastAPI Backend + MongoDB Persistence + Real Authentication:
  - Establish the foundational FastAPI application structure, CORS/security configuration, response envelope, and error handling.
  - Set up MongoDB Atlas connection pooling plus initial `users` and `roles` schemas, indexes, and repositories.
  - Implement `/api/v1/auth/register`, `/api/v1/auth/login`, `/api/v1/auth/refresh`, `/api/v1/auth/me`, and `/api/v1/auth/logout`.
  - Require and validate a unique institutional identifier at registration: student ID for students, or an institution-issued faculty/staff/management/administrator identifier for other roles. Login accepts this identifier or institutional email.
  - Hash passwords with Argon2id / Bcrypt; issue short-lived JWT access tokens and rotate HTTP-only refresh cookies.
  - Implement backend RBAC for the canonical role model: `student`, `faculty`, `admin`, `management`, and `staff`.
  - Connect frontend AuthContext to verified live FastAPI endpoints without changing the locked landing page.
  - Preserve immediate activation after backend validation and database storage, with zero Supabase Auth, SMTP, email verification, confirmation emails, activation tokens, fake production JWTs, or client-side password storage.

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
