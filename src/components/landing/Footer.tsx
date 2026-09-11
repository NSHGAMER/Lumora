import React from 'react';
import { Sparkles } from 'lucide-react';
import type { ActiveTab } from '../../types';

interface FooterProps {
  onSelectTab: (tab: ActiveTab) => void;
  onOpenJSR: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectTab, onOpenJSR }) => {
  return (
    <footer className="border-t border-white/10 bg-[#05070B] pt-16 pb-12 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => onSelectTab('home')}>
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-accent-cyan">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-heading font-bold text-xl tracking-wider text-white">LUMORA</span>
            </div>
            <p className="text-slate-400 font-sans text-xs sm:text-sm max-w-sm leading-relaxed">
              The Intelligent Campus Operating System. Designed with luxury dark aesthetics, sub-second telemetry, and JSR AI co-pilot integration.
            </p>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg w-fit">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>All Campus Nodes Operational (99.99%)</span>
            </div>
          </div>

          {/* Core Modules */}
          <div className="space-y-3">
            <div className="font-heading text-xs font-semibold text-white uppercase tracking-wider">
              OS Modules
            </div>
            <ul className="space-y-2 text-xs font-mono text-slate-400">
              <li>
                <button onClick={() => onSelectTab('command')} className="hover:text-cyan-400 transition-colors cursor-pointer">
                  Command Center
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTab('academics')} className="hover:text-cyan-400 transition-colors cursor-pointer">
                  Smart Academics
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTab('campus')} className="hover:text-cyan-400 transition-colors cursor-pointer">
                  3D Spatial Grid
                </button>
              </li>
              <li>
                <button onClick={onOpenJSR} className="hover:text-cyan-400 transition-colors cursor-pointer flex items-center gap-1 text-cyan-300">
                  <Sparkles className="w-3 h-3" /> JSR AI Assistant
                </button>
              </li>
            </ul>
          </div>

          {/* Architecture */}
          <div className="space-y-3">
            <div className="font-heading text-xs font-semibold text-white uppercase tracking-wider">
              Architecture
            </div>
            <ul className="space-y-2 text-xs font-mono text-slate-400">
              <li>FastAPI Microservices</li>
              <li>MongoDB Atlas Telemetry</li>
              <li>Three.js Spatial Engine</li>
              <li>Lenis Smooth Scroll</li>
              <li>Vercel Edge Deployment</li>
            </ul>
          </div>

          {/* Security & Access */}
          <div className="space-y-3">
            <div className="font-heading text-xs font-semibold text-white uppercase tracking-wider">
              Security
            </div>
            <ul className="space-y-2 text-xs font-mono text-slate-400">
              <li>Zero Trust OAuth2 / JWT</li>
              <li>Google & Microsoft Login</li>
              <li>FERPA & GDPR Compliant</li>
              <li>n8n Automation Webhooks</li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-500">
          <div>
            © {new Date().getFullYear()} Lumora Systems Inc. The Intelligent Campus Operating System.
          </div>
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <button
              onClick={() => onSelectTab('privacy')}
              className="hover:text-cyan-400 transition-colors cursor-pointer"
            >
              Privacy Protocol
            </button>
            <button
              onClick={() => onSelectTab('terms')}
              className="hover:text-cyan-400 transition-colors cursor-pointer"
            >
              Terms of Service
            </button>
            <button
              onClick={() => onSelectTab('cookie-preferences')}
              className="hover:text-cyan-400 transition-colors cursor-pointer"
            >
              Cookie Preferences
            </button>
            <button
              onClick={() => onSelectTab('maintenance')}
              className="hover:text-cyan-400 transition-colors cursor-pointer"
            >
              System Status
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
