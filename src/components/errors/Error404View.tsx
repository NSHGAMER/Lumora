import React from 'react';
import { Compass, Home, Search, Terminal } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { Badge } from '../ui/Badge';
import type { ActiveTab } from '../../types';

interface Error404ViewProps {
  onSelectTab: (tab: ActiveTab) => void;
}

export const Error404View: React.FC<Error404ViewProps> = ({ onSelectTab }) => {
  return (
    <div className="pt-28 pb-20 px-4 sm:px-6 min-h-[85vh] flex items-center justify-center">
      <div className="max-w-xl w-full text-center space-y-8">
        
        {/* Radar Icon Animation */}
        <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-cyan-500/10 border border-cyan-500/20 animate-ping" />
          <div className="absolute -inset-4 rounded-full bg-blue-500/5 border border-blue-500/10 animate-pulse" />
          <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0A1019] to-slate-900 border border-cyan-500/30 flex items-center justify-center shadow-accent-cyan">
            <Compass className="w-8 h-8 text-cyan-400 animate-spin-slow" />
          </div>
        </div>

        {/* Code & Title */}
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-2">
            <Badge variant="cyan" pulse>
              <span>Code 404</span>
            </Badge>
            <span className="text-xs font-mono text-slate-500">
              Sector: Spatial Null
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-heading font-bold text-white tracking-tight">
            Signal Lost.
          </h1>
          <p className="text-slate-400 font-sans text-sm sm:text-base max-w-md mx-auto leading-relaxed">
            The campus node, route coordinates, or module you requested are unmapped or have been migrated within the Lumora OS.
          </p>
        </div>

        {/* Diagnostic Card */}
        <GlassCard interactive={false} glowColor="cyan" className="text-left space-y-3 p-5 border-cyan-500/20">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 border-b border-white/5 pb-2">
            <span className="flex items-center gap-1.5 text-cyan-400">
              <Terminal className="w-3.5 h-3.5" />
              <span>Telemetry Diagnostic</span>
            </span>
            <span className="text-slate-500">Status: Unresolved</span>
          </div>
          <div className="font-mono text-xs text-slate-300 space-y-1">
            <div className="text-slate-400">$ resolve_coordinate --path current_url</div>
            <div className="text-rose-400/90">&gt; Error: Route entity not found in campus index.</div>
            <div className="text-slate-500">&gt; Recommended action: Return to root coordinate or use Command Search.</div>
          </div>
        </GlassCard>

        {/* Navigation Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => onSelectTab('home')}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-heading font-semibold text-xs shadow-accent-cyan transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>Return to Campus Hub</span>
          </button>
          
          <button
            type="button"
            onClick={() => onSelectTab('command')}
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-900/80 border border-white/10 hover:border-cyan-500/30 text-slate-300 hover:text-white font-mono text-xs transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Search className="w-4 h-4 text-cyan-400" />
            <span>Command Center</span>
          </button>
        </div>

      </div>
    </div>
  );
};
