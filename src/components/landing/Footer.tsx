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
            <button
              type="button"
              onClick={() => onSelectTab('home')}
              className="flex items-center gap-3 cursor-pointer text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60 rounded-xl"
              aria-label="Lumora Home - OS Showcase"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-accent-cyan">
                <Sparkles className="w-4 h-4 text-white" aria-hidden="true" />
              </div>
              <span className="font-heading font-bold text-xl tracking-wider text-white">LUMORA</span>
            </button>
            <p className="text-slate-400 font-sans text-xs sm:text-sm max-w-sm leading-relaxed">
              The Intelligent Campus Operating System. Designed with luxury dark aesthetics, sub-second telemetry, and JSR AI co-pilot integration.
            </p>
            <div
              role="status"
              aria-label="System status: All campus nodes operational (99.99%)"
              className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg w-fit"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true" />
              <span>All Campus Nodes Operational (99.99%)</span>
            </div>
          </div>

          {/* Core Modules */}
          <div className="space-y-3">
            <div className="font-heading text-xs font-semibold text-white uppercase tracking-wider">
              OS Modules
            </div>
            <ul className="space-y-2 text-xs font-mono">
              <li>
                <button
                  type="button"
                  onClick={() => onSelectTab('command')}
                  className="text-slate-400 hover:text-cyan-400 focus-visible:text-cyan-300 focus-visible:ring-1 focus-visible:ring-cyan-400/50 focus:outline-none rounded transition-colors cursor-pointer text-left"
                >
                  Command Center
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onSelectTab('academics')}
                  className="text-slate-400 hover:text-cyan-400 focus-visible:text-cyan-300 focus-visible:ring-1 focus-visible:ring-cyan-400/50 focus:outline-none rounded transition-colors cursor-pointer text-left"
                >
                  Smart Academics
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onSelectTab('campus')}
                  className="text-slate-400 hover:text-cyan-400 focus-visible:text-cyan-300 focus-visible:ring-1 focus-visible:ring-cyan-400/50 focus:outline-none rounded transition-colors cursor-pointer text-left"
                >
                  3D Spatial Grid
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenJSR}
                  className="text-cyan-300 hover:text-cyan-200 focus-visible:text-cyan-100 focus-visible:ring-1 focus-visible:ring-cyan-400/50 focus:outline-none rounded transition-colors cursor-pointer flex items-center gap-1 text-left"
                >
                  <Sparkles className="w-3 h-3 text-cyan-400" aria-hidden="true" /> JSR AI Assistant
                </button>
              </li>
            </ul>
          </div>

          {/* Architecture */}
          <div className="space-y-3">
            <div className="font-heading text-xs font-semibold text-white uppercase tracking-wider">
              Architecture Specs
            </div>
            <ul className="space-y-2 text-xs font-mono text-slate-400/90 select-text">
              <li className="flex items-center gap-1.5"><span className="text-slate-600 select-none">•</span> FastAPI Microservices</li>
              <li className="flex items-center gap-1.5"><span className="text-slate-600 select-none">•</span> MongoDB Atlas Telemetry</li>
              <li className="flex items-center gap-1.5"><span className="text-slate-600 select-none">•</span> Three.js Spatial Engine</li>
              <li className="flex items-center gap-1.5"><span className="text-slate-600 select-none">•</span> Lenis Smooth Scroll</li>
              <li className="flex items-center gap-1.5"><span className="text-slate-600 select-none">•</span> Vercel Edge Deployment</li>
            </ul>
          </div>

          {/* Security & Access */}
          <div className="space-y-3">
            <div className="font-heading text-xs font-semibold text-white uppercase tracking-wider">
              Security Specs
            </div>
            <ul className="space-y-2 text-xs font-mono text-slate-400/90 select-text">
              <li className="flex items-center gap-1.5"><span className="text-slate-600 select-none">•</span> Zero Trust OAuth2 / JWT</li>
              <li className="flex items-center gap-1.5"><span className="text-slate-600 select-none">•</span> Google & Microsoft Login</li>
              <li className="flex items-center gap-1.5"><span className="text-slate-600 select-none">•</span> FERPA & GDPR Compliant</li>
              <li className="flex items-center gap-1.5"><span className="text-slate-600 select-none">•</span> n8n Automation Webhooks</li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs font-mono text-slate-500">
          <div>
            © {new Date().getFullYear()} Lumora Systems Inc. The Intelligent Campus Operating System.
          </div>
          <nav aria-label="Footer Legal and Compliance Links" className="flex flex-wrap items-center gap-4 sm:gap-6">
            <button
              type="button"
              onClick={() => onSelectTab('privacy')}
              className="hover:text-cyan-400 focus-visible:text-cyan-300 focus-visible:ring-1 focus-visible:ring-cyan-400/50 focus:outline-none rounded transition-colors cursor-pointer"
            >
              Privacy Protocol
            </button>
            <button
              type="button"
              onClick={() => onSelectTab('terms')}
              className="hover:text-cyan-400 focus-visible:text-cyan-300 focus-visible:ring-1 focus-visible:ring-cyan-400/50 focus:outline-none rounded transition-colors cursor-pointer"
            >
              Terms of Service
            </button>
            <button
              type="button"
              onClick={() => onSelectTab('cookie-preferences')}
              className="hover:text-cyan-400 focus-visible:text-cyan-300 focus-visible:ring-1 focus-visible:ring-cyan-400/50 focus:outline-none rounded transition-colors cursor-pointer"
            >
              Cookie Preferences
            </button>
            <button
              type="button"
              onClick={() => onSelectTab('maintenance')}
              className="hover:text-cyan-400 focus-visible:text-cyan-300 focus-visible:ring-1 focus-visible:ring-cyan-400/50 focus:outline-none rounded transition-colors cursor-pointer"
            >
              System Status
            </button>
          </nav>
        </div>

      </div>
    </footer>
  );
};
