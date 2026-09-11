# RULES — Strict Engineering & Governance Rules

This document establishes the mandatory engineering standards, security invariants, architectural rules, and design constraints for all contributors and autonomous agents working on **Lumora — AI-Powered Campus Operating System**.

---

## 1. Core Engineering Directives

### RULE 1: Preserve Approved Lumora UI
Do not break, alter, replace, or simplify the existing approved Lumora UI. The visual language, composition, and styling of approved sections are strictly locked.

### RULE 2: No Unnecessary Dependencies
Do not introduce unnecessary third-party packages, libraries, or polyfills. Every dependency carries maintenance, bundle-size, and security overhead.

### RULE 3: Check Existing Dependencies First
Before adding any new library, thoroughly inspect `package.json` to verify whether existing dependencies (e.g., Lucide, Framer Motion, Three.js, clsx, tailwind-merge) already satisfy the requirement.

### RULE 4: Modular & Reusable Components
Structure code into small, highly focused, single-responsibility components and utility modules.

### RULE 5: No Monolithic Files
Do not create giant monolithic components (exceeding ~250–300 lines). Break complex views into discrete widgets, sub-panels, headers, and modals.

### RULE 6: Strict TypeScript Typing
Enforce strict TypeScript types across all components, hooks, utilities, and API interfaces. Avoid implicit type coercions.

### RULE 7: Zero Use of `any`
Do not use the `any` type unless there is a documented, unavoidable constraint (such as third-party library limitations). Always favor unknown, generics, or union types.

### RULE 8: Zero Hardcoded Secrets
Never hardcode API keys, database connection strings, JWT signing secrets, encryption salts, or private service tokens in client or server code.

### RULE 9: Environment Variable Discipline
Use standard environment variables (`.env`, `.env.example`) for all secrets and environment-specific configurations. Maintain clean `.env.example` templates without exposing actual secrets.

### RULE 10: Unified Backend Gateway
Frontend components must never connect directly to databases or external provider APIs. All requests must route through the backend API layer.

### RULE 11: Consistent Backend Error Envelope
Backend errors must return standardized, structured JSON error responses with clear machine-readable error codes and safe human-readable messages.

### RULE 12: Never Silently Swallow Errors
Never write empty `catch` blocks or discard error exceptions. Errors must be logged appropriately and communicated safely to the user or telemetry service.

### RULE 13: Comprehensive UI State Coverage
Every view, data-fetching component, and form must handle all 4 fundamental states:
- **Loading:** Skeleton or luxury progress indicator.
- **Empty:** Helpful empty-state messaging with call to action.
- **Success:** Polished visual feedback or rendered content.
- **Error:** Clear, non-technical explanation with retry option.

### RULE 14: Asynchronous Loading Feedback
Every important asynchronous UI operation (fetching, submitting, deleting, generating) must provide immediate visual feedback (button spinners, progress bars, or skeleton screens).

### RULE 15: Decouple Authentication & Authorization
Authentication (verifying who the user is) and authorization (verifying what the user is allowed to do) must be implemented and evaluated separately.

### RULE 16: Zero Default Resource Access
A logged-in user does not automatically have permission to access every system resource. Access must be evaluated against explicit role permissions.

### RULE 17: Enforce Role-Based Access Control (RBAC)
Enforce role-based access control (`student`, `faculty`, `admin`, `management`, `staff`) consistently across both frontend route/view guards and backend API endpoints.

### RULE 18: No Sensitive Data in Frontend Logs
Never log sensitive data—such as passwords, tokens, full student transcripts, fee account numbers, or personal contact details—to browser `console.log`.

### RULE 19: Dual-Layer Input Validation
Validate all user inputs on both the frontend (for instant user feedback) and the backend (for security and integrity).

### RULE 20: Never Trust Client Validation Alone
Frontend validation is purely for user experience. Backend validation is the authoritative gatekeeper and must treat all incoming payloads as untrusted.

### RULE 21: No Invented Backend Endpoints
Do not call fictional or non-existent backend endpoints in the frontend. All API integrations must correspond to verified, existing backend routes.

### RULE 22: Mark Pending Backend Functionality Honestly
When backend functionality is not yet implemented, clearly mark the UI component as pending or upcoming rather than faking successful operations or presenting fabricated data.

### RULE 23: Maintain Accessibility
Adhere to WCAG 2.1 AA accessibility standards wherever practical: proper ARIA labels, semantic HTML tags, keyboard navigation, and visible focus rings.

### RULE 24: Responsive Multi-Device Design
Maintain responsive, polished behavior across desktop, laptop, tablet, and mobile form factors.

### RULE 25: Consistent Lumora Design Tokens
Use the existing Lumora design system tokens (`lumora.bg`, `lumora.card`, `lumora.blue`, `lumora.cyan`, `lumora.purple`, `lumora.glass`, etc.) consistently across all new views.

### RULE 26: Preserve Visual Hierarchy
Do not randomly change colors, typography, borders, shadows, spacing scale, animation speeds, or layout compositions.

### RULE 27: Inspect Before Modifying
Before touching any existing component or locked section, thoroughly inspect its current implementation, dependencies, and behavior to guarantee zero regression.

### RULE 28: Synchronized Documentation
Keep documentation files (`PRD.md`, `ARCHITECTURE.md`, `RULES.md`, `PHASES.md`, `DESIGN.md`, `MEMORY.md`) continuously synchronized with code changes.

### RULE 29: Mandatory MEMORY.md Updates
Update `MEMORY.md` immediately after completing any meaningful milestone, architectural decision, or phase transition.

### RULE 30: Pre-Change Specification Review
Before initiating any major architectural or structural change, thoroughly review `PRD.md`, `ARCHITECTURE.md`, `RULES.md`, `PHASES.md`, and `DESIGN.md`.

---

## 2. Authentication & Account Lifecycle Invariants

### Invariant A: No Email Verification & No SMTP
- Lumora **MUST NOT** implement email verification at this stage.
- **Do NOT** add SMTP or email-confirmation requirements to registration.
- The registration flow is:
  `User` → `Registration Form` → `Backend Validation` → `Password Hashing` → `Create User` → `Account Immediately Active` → `Login`.
- There must be:
  - NO email verification.
  - NO verification email.
  - NO confirmation email.
  - NO SMTP dependency or server connection.
  - NO "verify your email" screen.
  - NO email confirmation token required for account activation.
  - NO external email service required for registration.
- Email is stored purely as a profile/contact field and must NOT gate account activation.

### Invariant B: Password Recovery Constraint
- Do **NOT** build a password-reset system that silently depends on SMTP.
- Password recovery must remain documented as a planned feature.
- Future recovery will utilize secure authenticated in-app password changes, administrator-assisted resets, or approved institutional identity verification.
- Never send password-reset emails unless an email service is explicitly configured and approved in later phases.
