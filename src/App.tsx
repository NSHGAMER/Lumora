import { useState, useEffect } from 'react';
import Lenis from 'lenis';
import type { ActiveTab, SystemRole } from './types';
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

export function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [role, setRole] = useState<SystemRole>('student');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isJSRAssistantOpen, setIsJSRAssistantOpen] = useState(false);
  const [jsrInitialQuery, setJsrInitialQuery] = useState('');

  // Initialize Lenis Smooth Scroll
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
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
        onSelectTab={setActiveTab}
        role={role}
        onChangeRole={setRole}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onOpenJSR={() => handleOpenJSR()}
      />

      {/* Main Content Area */}
      <main className="relative z-10">
        {activeTab === 'home' && (
          <>
            <HeroSection
              onOpenCommandCenter={() => setActiveTab('command')}
              onOpenJSR={() => handleOpenJSR()}
              onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
            />
            <ProblemSection />
            <JSRCoreSection />
            <LivingCampusSection />
            <OperatingSystemMetrics />
            <FeatureShowcase
              onSelectTab={setActiveTab}
              onOpenJSR={handleOpenJSR}
            />
            <TestimonialGrid />
          </>
        )}

        {activeTab === 'command' && (
          <CommandCenterView
            role={role}
            onOpenJSR={handleOpenJSR}
            onSelectTab={setActiveTab}
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
      </main>

      {/* Global Footer */}
      <Footer
        onSelectTab={setActiveTab}
        onOpenJSR={() => handleOpenJSR()}
      />

      {/* Command Palette Modal (Cmd+K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectTab={setActiveTab}
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

export default App;
