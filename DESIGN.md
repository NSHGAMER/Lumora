# DESIGN — Approved Visual Language & Design System

This document specifies the locked design tokens, aesthetic standards, and UI guidelines for **Lumora — AI-Powered Campus Operating System**.

---

## 1. Aesthetic Identity & Philosophy

- **Style:** Futuristic, Premium, Intelligent, Minimalist, High-Tech, Enterprise-Grade.
- **Atmosphere:** Deep cosmic dark space with high-precision translucent glass interfaces, subtle neon data conduits, laser-thin borders, and smooth physics-driven motion.
- **Strict Constraint:** **Do NOT replace, simplify, or redesign the existing Lumora visual language with generic Bootstrap, generic dashboard templates, generic SaaS UI, or unstyled default component libraries.** Every new screen must feel native to the Lumora universe.

---

## 2. Locked Approved Components

The following components represent the approved, production-grade visual baseline of Lumora. Their visual identity, layout composition, and animation profiles are **LOCKED**:

1. **`Navbar` (`src/components/navbar/Navbar.tsx`):** Floating glass header with ambient blur, role switcher, navigation tabs, JSR launch button, and Command Palette (`Cmd+K`) shortcut.
2. **`HeroSection` (`src/components/landing/HeroSection.tsx`):** Spatial interactive 3D canvas, live status telemetry pills, high-contrast typography, and primary CTA triggers.
3. **`ProblemSection` (`src/components/landing/ProblemSection.tsx`):** Split-view contrast comparing legacy fragmented ERP silos against the unified Lumora OS.
4. **`JSRCoreSection` (`src/components/landing/JSRCoreSection.tsx`):** Visual depiction of JSR's neural core, multi-agent orchestration, and autonomous execution pipelines.
5. **`LivingCampusSection` (`src/components/landing/LivingCampusSection.tsx`):** Real-time spatial telemetry of campus facilities, energy grids, and workstation density.
6. **`OperatingSystemMetrics` (`src/components/landing/OperatingSystemMetrics.tsx`):** Quantified institutional performance stats.
7. **`FeatureShowcase` (`src/components/landing/FeatureShowcase.tsx`):** Interactive module explorer with tabs and deep-dive telemetry previews.
8. **`TestimonialGrid` (`src/components/landing/TestimonialGrid.tsx`):** Luxury cards highlighting verified faculty, student, and administrator feedback.
9. **`Footer` (`src/components/landing/Footer.tsx`):** System status heartbeat, institutional links, and platform badges.
10. **`CommandCenterView` (`src/components/dashboard/CommandCenterView.tsx`):** Modular role-based dashboard widgets and quick actions.
11. **`AcademicsView` (`src/components/academics/AcademicsView.tsx`):** Schedule matrix, workload gauges, and syllabus progress.
12. **`CampusGridView` (`src/components/campus/CampusGridView.tsx`):** Interactive facility status cards with temperature, occupancy, and workstation availability.
13. **`JSRAssistantModal` (`src/components/jsr/JSRAssistantModal.tsx`):** Floating conversational AI co-pilot with quick suggestion prompts, markdown parsing, and code blocks.
14. **`CommandPalette` (`src/components/ui/CommandPalette.tsx`):** Fast modal search across courses, actions, roles, and AI prompts.
15. **`CursorGlow` (`src/components/ui/CursorGlow.tsx`):** Ambient cursor-following luminous radial gradient.

---

## 3. Color Palette & Token Architecture

### 3.1 Dark Mode (Primary & Default)
```css
/* Background & Surfaces */
--lumora-bg:          #05070B; /* Deepest void canvas */
--lumora-card:        #0A1019; /* Translucent midnight slate */
--lumora-card-hover:  #0F172A; /* Elevated interactive hover */
--lumora-border:      rgba(255, 255, 255, 0.08); /* Precision laser edge */

/* Accents & Intelligence Glow */
--lumora-blue:        #3B82F6; /* Primary system blue */
--lumora-cyan:        #06B6D4; /* JSR neural intelligence accent */
--lumora-purple:      #8B5CF6; /* Workflow automation & agents */
--lumora-green:       #22C55E; /* Optimal health, online state */
--lumora-gold:        #F59E0B; /* Critical notices & warnings */

/* Typography */
--lumora-text:        #F8FAFC; /* Crisp, high-contrast readable white */
--lumora-muted:       #94A3B8; /* Secondary technical metadata slate */
```

### 3.2 Light Mode Strategy
Light Mode must be derived from the **same design tokens**, maintaining the futuristic high-tech precision rather than presenting an unrelated theme:
- Light background uses an ultra-clean iced slate (`#F8FAFC` to `#F1F5F9`).
- Surface cards utilize frosted white glass (`rgba(255, 255, 255, 0.85)` with backdrop blur).
- Borders remain ultra-fine (`rgba(0, 0, 0, 0.08)`).
- Intelligence accents (Blue, Cyan, Purple) maintain high visual presence and contrast.

---

## 4. Typography Hierarchy

| Role | Font Family | Weights | Usage |
| :--- | :--- | :--- | :--- |
| **Headings & Display** | `Space Grotesk`, sans-serif | 600, 700 | Hero titles, section headings, card titles |
| **Body & UI** | `Inter`, sans-serif | 400, 500, 600 | General interface copy, forms, descriptions |
| **Code, Data & Stats** | `JetBrains Mono`, monospace | 400, 500 | Telemetry data, coordinates, status pills, code snippets |

---

## 5. Reusable Utility Classes & Patterns

### 5.1 Glass Surfaces
```css
.glass-panel {
  background: rgba(10, 16, 25, 0.7);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.glass-panel-interactive {
  background: rgba(10, 16, 25, 0.6);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.glass-panel-interactive:hover {
  background: rgba(15, 23, 42, 0.8);
  border-color: rgba(6, 182, 212, 0.3);
  box-shadow: 0 10px 30px -10px rgba(6, 182, 212, 0.25);
  transform: translateY(-2px);
}
```

### 5.2 Dynamic Text Gradients
- `.text-gradient`: Linear fade from pure white to muted slate.
- `.text-gradient-cyan`: Cyan to blue to purple luminescence.
- `.text-gradient-gold`: Amber to warm rose accent.

### 5.3 Grid Patterns & Subtle Backgrounds
- `.bg-grid-pattern`: 40px × 40px subtle grid using `rgba(255, 255, 255, 0.03)` lines for subtle depth.

---

## 6. Implementation Standards for New Screens

All upcoming views (Legal, UX Error Pages, Auth Forms, Dashboards, Skeletons) must follow these rules:
1. **Container Alignment:** Max-width containers (`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`) with consistent vertical rhythm.
2. **Interactive States:** Subtle hover glows, micro-interactions using Framer Motion, and distinct keyboard focus rings (`focus:ring-2 focus:ring-cyan-500/50`).
3. **Skeleton Loaders:** Skeletons must use subtle shimmer animations over `rgba(255, 255, 255, 0.04)` backgrounds matching exact component dimensions.
4. **No Placeholders:** If assets or diagrams are required, generate high-fidelity vector graphics or use curated icons from `lucide-react`.
