import { useState, useEffect, useCallback, useRef } from 'react';
import Lenis from 'lenis';
import type { ActiveTab, SystemRole } from './types';
import { AuthProvider, useAuth } from './auth';
import { Navbar } from './components/navbar/Navbar';
import { HeroSection } from './components/landing/HeroSection';
import { ProblemSection } from './components/landing/ProblemSection';
import { JSRCoreSection } from './components/landing/JSRCoreSection';
import { LivingCampusSection } from './components/landing/LivingCampusSection';
import { OperatingSystemMetrics } from './components/landing/OperatingSystemMetrics';
import { FeatureShowcase } from './components/landing/FeatureShowcase';
import { TestimonialGrid } from './components/landing/TestimonialGrid';
import { Footer } from './components/landing/Footer';
import { CommandCenterView } from './components/dashboard/CommandCenterView';
import { AcademicsView } from './components/academics/AcademicsView';
import { CampusGridView } from './components/campus/CampusGridView';
import { JSRAssistantModal } from './components/jsr/JSRAssistantModal';
import { CommandPalette } from './components/ui/CommandPalette';
import { CursorGlow } from './components/ui/CursorGlow';

// Phase 1 Legal & UX Resilience Views
import { PrivacyPolicyView } from './components/legal/PrivacyPolicyView';
import { TermsOfServiceView } from './components/legal/TermsOfServiceView';
import { CookiePreferencesView } from './components/legal/CookiePreferencesView';
import { Error404View } from './components/errors/Error404View';
import { Error403View } from './components/errors/Error403View';
import { Error500View } from './components/errors/Error500View';
import { MaintenanceView } from './components/errors/MaintenanceView';
import { ErrorBoundary } from './components/errors/ErrorBoundary';

// Phase 2A Authentication Views
import {
  LoginView,
  RegisterView,
  ForgotPasswordView,
  ResetPasswordView,
  AccountSettingsView,
} from './components/auth';

function getTabFromPathname(pathname: string): ActiveTab {
  const clean = pathname.replace(/\/+$/, '').toLowerCase();
  if (!clean || clean === '' || clean === '/') return 'home';
  if (clean === '/command') return 'command';
  if (clean === '/academics') return 'academics';
  if (clean === '/campus') return 'campus';
  if (clean === '/privacy') return 'privacy';
  if (clean === '/terms') return 'terms';
  if (clean === '/cookie-preferences') return 'cookie-preferences';
  if (clean === '/login') return 'login';
  if (clean === '/register') return 'register';
  if (clean === '/forgot-password') return 'forgot-password';
  if (clean === '/reset-password') return 'reset-password';
  if (clean === '/account') return 'account';
  if (clean === '/404') return '404';
  if (clean === '/403') return '403';
  if (clean === '/500') return '500';
  if (clean === '/maintenance') return 'maintenance';
  // Any unrecognized route automatically renders the 404 experience
  return '404';
}

function getPathnameFromTab(tab: ActiveTab): string {
  if (tab === 'home') return '/';
  return `/${tab}`;
}

function AppContent() {
  const [activeTab, setActiveTab] = useState<ActiveTab>(() => getTabFromPathname(window.location.pathname));
  const { user } = useAuth();
  const [role, setRole] = useState<SystemRole>('student');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isJSRAssistantOpen, setIsJSRAssistantOpen] = useState(false);
  const [jsrInitialQuery, setJsrInitialQuery] = useState('');
  const lenisRef = useRef<Lenis | null>(null);

  // Sync role with authenticated user if available
  useEffect(() => {
    if (user?.role) {
      setRole(user.role);
    }
  }, [user]);

  // Initialize Lenis Smooth Scroll
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    lenisRef.current = lenis;

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // Sync browser back/forward buttons with ActiveTab
  useEffect(() => {
    const handlePopState = () => {
      const tab = getTabFromPathname(window.location.pathname);
      setActiveTab(tab);
      if (lenisRef.current) {
        lenisRef.current.scrollTo(0, { immediate: true });
      } else {
        window.scrollTo(0, 0);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleSelectTab = useCallback((tab: ActiveTab) => {
    setActiveTab(tab);
    const targetPath = getPathnameFromTab(tab);
    if (window.location.pathname !== targetPath) {
      window.history.pushState(null, '', targetPath);
    }
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: false, duration: 0.8 });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  const handleOpenJSR = (query?: string) => {
    if (query) setJsrInitialQuery(query);
    else setJsrInitialQuery('');
    setIsJSRAssistantOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#05070B] text-[#F8FAFC] font-sans selection:bg-cyan-500/30 selection:text-cyan-200 relative">
      
      {/* Ambient Cursor Glow Effect */}
      <CursorGlow />

      {/* Floating Glass Navigation Header */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        role={role}
        onChangeRole={setRole}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onOpenJSR={() => handleOpenJSR()}
      />

      {/* Main Content Area Protected by Error Boundary */}
      <ErrorBoundary onSelectTab={handleSelectTab}>
        <main className="relative z-10 min-h-[75vh]">
          {/* Approved Locked Landing Page Baseline */}
          {activeTab === 'home' && (
            <>
              <HeroSection
                onOpenCommandCenter={() => handleSelectTab('command')}
                onOpenJSR={() => handleOpenJSR()}
                onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
              />
              <ProblemSection />
              <JSRCoreSection />
              <LivingCampusSection />
              <OperatingSystemMetrics />
              <FeatureShowcase
                onSelectTab={handleSelectTab}
                onOpenJSR={handleOpenJSR}
              />
              <TestimonialGrid />
            </>
          )}

          {/* Core Interactive Modules */}
          {activeTab === 'command' && (
            <CommandCenterView
              role={role}
              onOpenJSR={handleOpenJSR}
              onSelectTab={handleSelectTab}
            />
          )}

          {activeTab === 'academics' && (
            <AcademicsView
              onOpenJSR={handleOpenJSR}
            />
          )}

          {activeTab === 'campus' && (
            <CampusGridView
              onOpenJSR={handleOpenJSR}
            />
          )}

          {/* Phase 1 Legal Suite */}
          {activeTab === 'privacy' && (
            <PrivacyPolicyView onSelectTab={handleSelectTab} />
          )}

          {activeTab === 'terms' && (
            <TermsOfServiceView onSelectTab={handleSelectTab} />
          )}

          {activeTab === 'cookie-preferences' && (
            <CookiePreferencesView onSelectTab={handleSelectTab} />
          )}

          {/* Phase 1 UX Resilience & Error States */}
          {activeTab === '404' && (
            <Error404View onSelectTab={handleSelectTab} />
          )}

          {activeTab === '403' && (
            <Error403View onSelectTab={handleSelectTab} />
          )}

          {activeTab === '500' && (
            <Error500View onSelectTab={handleSelectTab} />
          )}

          {activeTab === 'maintenance' && (
            <MaintenanceView onSelectTab={handleSelectTab} />
          )}

          {/* Phase 2A Authentication Views */}
          {activeTab === 'login' && (
            <LoginView onSelectTab={handleSelectTab} />
          )}

          {activeTab === 'register' && (
            <RegisterView onSelectTab={handleSelectTab} />
          )}

          {activeTab === 'forgot-password' && (
            <ForgotPasswordView onSelectTab={handleSelectTab} />
          )}

          {activeTab === 'reset-password' && (
            <ResetPasswordView onSelectTab={handleSelectTab} />
          )}

          {activeTab === 'account' && (
            <AccountSettingsView onSelectTab={handleSelectTab} />
          )}
        </main>
      </ErrorBoundary>

      {/* Global Footer with Preserved Aesthetics & Functional Legal Links */}
      <Footer
        onSelectTab={handleSelectTab}
        onOpenJSR={() => handleOpenJSR()}
      />

      {/* Command Palette Modal (Cmd+K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectTab={handleSelectTab}
        onOpenJSR={handleOpenJSR}
      />

      {/* JSR AI Co-Pilot Assistant Modal */}
      <JSRAssistantModal
        isOpen={isJSRAssistantOpen}
        onClose={() => setIsJSRAssistantOpen(false)}
        initialQuery={jsrInitialQuery}
      />

    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
