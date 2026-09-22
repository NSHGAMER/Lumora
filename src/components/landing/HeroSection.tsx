import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Command, ShieldCheck, Cpu, Activity } from 'lucide-react';
import { MagneticButton } from '../ui/MagneticButton';
import { Badge } from '../ui/Badge';
import { HeroConstellation } from '../3d/HeroConstellation';

interface HeroSectionProps {
  onOpenCommandCenter: () => void;
  onOpenJSR: () => void;
  onOpenCommandPalette: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onOpenCommandCenter,
  onOpenJSR,
  onOpenCommandPalette,
}) => {
  return (
    <section className="relative min-h-screen flex flex-col justify-center items-center pt-28 pb-16 px-4 sm:px-6 overflow-hidden">
      {/* 3D Particle Constellation Background */}
      <HeroConstellation />

      {/* Grid Overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none" />

      {/* Hero Central Content */}
      <div className="relative z-10 max-w-5xl mx-auto text-center space-y-8">
        
        {/* Top Floating Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2"
        >
          <Badge variant="cyan" pulse>
            LUMORA OS 3.4 RELEASED
          </Badge>
          <span className="text-xs font-mono text-slate-400 hidden sm:inline-block">
            Powered by JSR AI Core & Three.js Telemetry
          </span>
        </motion.div>

        {/* 72px+ Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-heading font-extrabold tracking-tight text-white leading-[1.05]"
        >
          The Intelligent Campus <br className="hidden sm:inline" />
          <span className="text-gradient-cyan">Operating System.</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-2xl mx-auto text-base sm:text-xl text-slate-400 font-sans font-light leading-relaxed"
        >
          Re-imagining higher education with high-density intelligence, real-time spatial telemetry, automated academic routing, and JSR AI co-pilot.
        </motion.p>

        {/* CTA Button Group */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-4 pt-4"
        >
          <MagneticButton
            variant="primary"
            onClick={onOpenCommandCenter}
            className="px-8 py-4 text-base"
          >
            Launch Command Center
          </MagneticButton>

          <MagneticButton
            variant="glow"
            onClick={onOpenJSR}
            className="px-8 py-4 text-base"
          >
            <Sparkles className="w-5 h-5 text-cyan-400" aria-hidden="true" />
            Talk to JSR AI
          </MagneticButton>
        </motion.div>

        {/* Keyboard shortcut hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="pt-2 flex items-center justify-center"
        >
          <button
            type="button"
            onClick={onOpenCommandPalette}
            aria-label="Open Spotlight Command Palette (or press Command-K)"
            className="group inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/60 border border-white/10 hover:border-cyan-500/40 text-xs font-mono text-slate-400 hover:text-slate-200 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50"
          >
            <span>Press</span>
            <kbd className="px-2 py-0.5 rounded bg-slate-900 border border-white/10 group-hover:border-cyan-500/40 text-slate-300 transition-colors inline-flex items-center gap-1">
              <Command className="w-3 h-3 text-cyan-400" aria-hidden="true" />
              <span>K</span>
            </kbd>
            <span>anytime to open Spotlight Command Palette</span>
          </button>
        </motion.div>
      </div>

      {/* Futuristic Mockup Display Card */}
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1, delay: 0.4, type: 'spring', stiffness: 100 }}
        className="relative z-10 w-full max-w-6xl mx-auto mt-16 rounded-2xl glass-panel p-2 border border-white/15 shadow-2xl shadow-cyan-950/30 overflow-hidden"
      >
        <div className="rounded-xl bg-[#05070B] border border-white/10 p-4 sm:p-6 space-y-4">
          
          {/* Top Window Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10 text-xs font-mono text-slate-400">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="ml-2 text-slate-300 font-semibold">lumora-os // command-center-v3.4</span>
            </div>
            <div className="flex items-center gap-4 hidden sm:flex">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <Activity className="w-3.5 h-3.5" />
                GPU Cluster: 99.4%
              </span>
              <span className="flex items-center gap-1.5 text-cyan-400">
                <Cpu className="w-3.5 h-3.5" />
                JSR Response: 14ms
              </span>
            </div>
          </div>

          {/* Inner Grid Preview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            <div className="p-4 rounded-xl bg-[#0A1019] border border-white/10 space-y-2">
              <div className="text-xs font-mono text-cyan-400 flex items-center justify-between">
                <span>ACTIVE ENROLLMENT MATRIX</span>
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <div className="text-2xl font-heading font-bold text-white">18,420 Students</div>
              <p className="text-xs text-slate-400">99.8% AI class placement satisfaction rate</p>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full w-[94%]" />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#0A1019] border border-white/10 space-y-2">
              <div className="text-xs font-mono text-purple-400 flex items-center justify-between">
                <span>JSR AI CO-PILOT QUERIES</span>
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div className="text-2xl font-heading font-bold text-white">142,890 Today</div>
              <p className="text-xs text-slate-400">Automated grading & study roadmaps</p>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-purple-500 to-cyan-400 h-full w-[88%]" />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#0A1019] border border-white/10 space-y-2">
              <div className="text-xs font-mono text-emerald-400 flex items-center justify-between">
                <span>3D TELEMETRY GRID</span>
                <Activity className="w-3.5 h-3.5" />
              </div>
              <div className="text-2xl font-heading font-bold text-white">48 Buildings Sync</div>
              <p className="text-xs text-slate-400">Smart HVAC & energy load optimization</p>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-full w-[96%]" />
              </div>
            </div>

          </div>
        </div>
      </motion.div>
    </section>
  );
};
