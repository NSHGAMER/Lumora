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

---

## C. Current Phase
- **Phase 0 — Foundation:** `Completed`
- **Phase 1 — Public Experience:** `In Progress` (Completing legal compliance suite and UX error/loading states)

---

## D. Current Active File
- Project Governance Documentation Suite: `PRD.md`, `ARCHITECTURE.md`, `RULES.md`, `PHASES.md`, `DESIGN.md`, `MEMORY.md`.

---

## E. Last Completed Task
- Established and synced all 6 core project governance and specification files in the project root.
- Verified that the current application compiles and builds cleanly without errors (`npm run build` exits 0, `oxlint` 0 warnings, 0 errors).

---

## F. Next Task
- Implement Phase 1 missing public experiences according to the locked Lumora design system:
  1. Legal pages: `/privacy`, `/terms`, `/cookie-preferences`
  2. UX Error & Status states: `404 Not Found`, `403 Forbidden`, `500 Server Error`, `Maintenance Mode`
  3. Reusable Skeleton Loading components for cards, tables, dashboards, and AI responses.

---

## G. Important Architectural & Design Decisions
1. **Approved UI is Locked:** The existing Lumora visual language, navbar, hero section, living campus section, color system, typography, and dark futuristic identity are locked. New components must adhere to this design language.
2. **Authentication Invariant — No Email Verification:** Email verification is explicitly disabled. There is NO verification email, NO confirmation email, NO SMTP dependency, NO "verify your email" screen, and NO activation tokens. Registration immediately activates the account upon backend validation.
3. **Authentication Invariant — Extensibility:** Email is stored as a profile field. Email verification/notifications can be plugged in later as an optional microservice without rewriting the core auth pipeline.
4. **Password Recovery Invariant — No Silent SMTP:** Password recovery is documented as a planned feature. It will not depend silently on SMTP; future implementations will evaluate secure in-app authenticated password change, administrator-assisted reset, or university SSO/SAML recovery.
5. **Data Integrity Guarantee:** Never expose fabricated institutional data as real data. When backend services or endpoints are not yet active, the interface must honestly state their pending status.
6. **Zero Client Secrets:** Protected database credentials, signing keys, and external service tokens must never exist in frontend code.

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
