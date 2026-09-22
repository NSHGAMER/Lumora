import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Sparkles, Calendar, MapPin, CheckCircle2 } from 'lucide-react';
import { MagneticButton } from '../ui/MagneticButton';
import type { ActiveTab } from '../../types';

interface FeatureShowcaseProps {
  onSelectTab: (tab: ActiveTab) => void;
  onOpenJSR: () => void;
}

export const FeatureShowcase: React.FC<FeatureShowcaseProps> = ({
  onSelectTab,
  onOpenJSR,
}) => {
  const [activeFeature, setActiveFeature] = useState(0);

  const features = [
    {
      id: 'cmd-center',
      title: 'Command Center',
      tagline: 'High-Density Operational Intelligence',
      description: 'Replace fragmented legacy university portals with a single, unified operating system dashboard. Monitor live server loads, track student attendance, and execute actions in milliseconds.',
      icon: LayoutDashboard,
      tabTarget: 'command' as ActiveTab,
      highlights: [
        'Sub-millisecond keyboard shortcuts (Cmd+K)',
        'Role-aware access control (Student / Faculty / Admin)',
        'Real-time GPU cluster telemetry',
      ],
      previewContent: (
        <div className="space-y-3 font-mono text-xs">
          <div className="p-3 rounded-lg bg-slate-900 border border-cyan-500/30 flex items-center justify-between text-cyan-300">
            <span>SYS_HEALTH: OPTIMAL</span>
            <span>UPTIME: 99.998%</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="p-3 rounded-lg bg-slate-900 border border-white/10 text-slate-300">
              <div className="text-[10px] text-slate-500">ACTIVE COURSES</div>
              <div className="text-lg font-bold text-white">412 Sessions</div>
            </div>
            <div className="p-3 rounded-lg bg-slate-900 border border-white/10 text-slate-300">
              <div className="text-[10px] text-slate-500">GPU NODE CLUSTER</div>
              <div className="text-lg font-bold text-emerald-400">128 H100s Active</div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'jsr-ai',
      title: 'JSR AI Engine',
      tagline: 'Sub-second Campus Co-Pilot',
      description: 'JSR is not a cartoonish chatbot. It is a highly sophisticated neural engine trained on university curriculum, campus logistics, code bases, and research archives.',
      icon: Sparkles,
      tabTarget: 'jsr' as ActiveTab,
      highlights: [
        'Instant assignment code review & mathematical proof validation',
        'Dynamic prerequisite path recommendations',
        'Voice synthesis with low-latency audio wave response',
      ],
      previewContent: (
        <div className="space-y-2 font-mono text-xs">
          <div className="p-3 rounded-lg bg-cyan-950/60 border border-cyan-500/30 text-cyan-200">
            <span className="text-cyan-400 font-bold">JSR: </span>
            &quot;I noticed a 3-hour gap in your Wednesday schedule. I have pre-booked Quantum Lab Workstation B-12 for your research session.&quot;
          </div>
          <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-emerald-300 text-xs">
            ✓ Schedule optimized • Room Reserved • Calendar Synced
          </div>
        </div>
      ),
    },
    {
      id: 'academics',
      title: 'Smart Course Matrix',
      tagline: 'Zero-Conflict Timetable Engine',
      description: 'Algorithmic course scheduling that prevents time overlaps, balances weekly workload intensity scores, and projects future GPA trajectories dynamically.',
      icon: Calendar,
      tabTarget: 'academics' as ActiveTab,
      highlights: [
        'Automated workload balance scoring (1-10 scale)',
        'Interactive course dependency tree diagram',
        'Instant add/drop swap simulator',
      ],
      previewContent: (
        <div className="space-y-2 font-mono text-xs">
          <div className="flex justify-between items-center p-2 rounded bg-slate-900 border border-white/10 text-slate-200">
            <span>CS401: Quantum Computing</span>
            <span className="text-cyan-400">Workload: 8.4/10</span>
          </div>
          <div className="flex justify-between items-center p-2 rounded bg-slate-900 border border-white/10 text-slate-200">
            <span>DS302: Neural Architecture</span>
            <span className="text-purple-400">Workload: 7.1/10</span>
          </div>
        </div>
      ),
    },
    {
      id: 'spatial-grid',
      title: '3D Campus Grid',
      tagline: 'Spatial IoT Telemetry & Booking',
      description: 'Visualize every building on campus in a live 3D web canvas. Monitor library quiet zone seating, HVAC energy consumption, and lab equipment availability.',
      icon: MapPin,
      tabTarget: 'campus' as ActiveTab,
      highlights: [
        'Interactive 3D Three.js building mesh representation',
        'Real-time lab station & focus pod reservations',
        'Automated campus energy load balancing',
      ],
      previewContent: (
        <div className="space-y-2 font-mono text-xs">
          <div className="p-3 rounded-lg bg-slate-900 border border-white/10 text-slate-300 flex justify-between">
            <span>Turing Science Hub</span>
            <span className="text-emerald-400">32 Workstations Open</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-900 border border-white/10 text-slate-300 flex justify-between">
            <span>Quantum Library L3</span>
            <span className="text-amber-400">Quiet Zone: 88% Full</span>
          </div>
        </div>
      ),
    },
  ];

  const current = features[activeFeature];

  return (
    <section className="py-24 px-4 sm:px-6 max-w-7xl mx-auto space-y-12">
      
      {/* Title */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl sm:text-5xl font-heading font-bold text-white">
          Architected for <span className="text-gradient-cyan">Maximum Performance.</span>
        </h2>
        <p className="text-slate-400 font-sans max-w-2xl mx-auto text-sm sm:text-base">
          Every sub-system in Lumora has been designed with Apple-level precision and Stripe-grade reliability.
        </p>
      </div>

      {/* Tab Navigation Controls */}
      <div className="flex flex-wrap items-center justify-center gap-2 max-w-4xl mx-auto">
        {features.map((feat, idx) => {
          const Icon = feat.icon;
          const isActive = activeFeature === idx;
          return (
            <button
              key={feat.id}
              onClick={() => setActiveFeature(idx)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-heading text-xs sm:text-sm font-medium transition-all duration-300 cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600/30 to-cyan-500/30 border border-cyan-400/50 text-white shadow-accent-cyan'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-white/5 hover:border-white/10'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
              <span>{feat.title}</span>
            </button>
          );
        })}
      </div>

      {/* Active Feature Detail Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4 }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center glass-panel p-6 sm:p-10 rounded-3xl border border-white/10 shadow-2xl"
        >
          {/* Left Column: Details */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest">
                {current.tagline}
              </span>
              <h3 className="text-2xl sm:text-4xl font-heading font-bold text-white">
                {current.title}
              </h3>
              <p className="text-slate-300 font-sans text-sm sm:text-base leading-relaxed">
                {current.description}
              </p>
            </div>

            {/* Bullet Points */}
            <div className="space-y-2.5">
              {current.highlights.map((h, i) => (
                <div key={i} className="flex items-center gap-3 text-sm text-slate-200 font-sans">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>{h}</span>
                </div>
              ))}
            </div>

            {/* Action Trigger */}
            <div className="pt-2">
              <MagneticButton
                variant="primary"
                onClick={() => {
                  if (current.tabTarget === 'jsr') onOpenJSR();
                  else onSelectTab(current.tabTarget);
                }}
              >
                Open {current.title} Module
              </MagneticButton>
            </div>
          </div>

          {/* Right Column: Live Mockup Interactive Container */}
          <div className="lg:col-span-5 rounded-2xl bg-[#05070B] border border-white/10 p-6 space-y-4 shadow-inner">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 pb-2 border-b border-white/10">
              <span className="flex items-center gap-2 text-cyan-400">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                LIVE MODULE INSTANCE
              </span>
              <span>LUMORA KERNEL</span>
            </div>
            {current.previewContent}
          </div>
        </motion.div>
      </AnimatePresence>
    </section>
  );
};
