import React from 'react';
import { AlertOctagon, RotateCcw, Home, Terminal } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { Badge } from '../ui/Badge';
import type { ActiveTab } from '../../types';

interface Error500ViewProps {
  onSelectTab: (tab: ActiveTab) => void;
  onRetry?: () => void;
  errorReferenceId?: string;
}

export const Error500View: React.FC<Error500ViewProps> = ({
  onSelectTab,
  onRetry,
  errorReferenceId = 'FAULT-NODE-77B',
}) => {
  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="pt-28 pb-20 px-4 sm:px-6 min-h-[85vh] flex items-center justify-center">
      <div className="max-w-xl w-full text-center space-y-8">
        
        {/* Octagon Fault Animation */}
        <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-rose-500/10 border border-rose-500/20 animate-pulse" />
          <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0A1019] to-slate-900 border border-rose-500/30 flex items-center justify-center shadow-lg shadow-rose-500/10">
            <AlertOctagon className="w-8 h-8 text-rose-400" />
          </div>
        </div>

        {/* Code & Title */}
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-2">
            <Badge variant="amber">
              <span>Code 500</span>
            </Badge>
            <span className="text-xs font-mono text-slate-500">
              Reference: {errorReferenceId}
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-heading font-bold text-white tracking-tight">
            System Fault.
          </h1>
          <p className="text-slate-400 font-sans text-sm sm:text-base max-w-md mx-auto leading-relaxed">
            An unexpected runtime condition occurred within the campus operating system. Telemetry has logged the event for diagnostics.
          </p>
        </div>

        {/* Diagnostic Containment Card — No stack traces or secrets exposed */}
        <GlassCard interactive={false} glowColor="none" className="text-left space-y-3 p-5 border-rose-500/20">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 border-b border-white/5 pb-2">
            <span className="flex items-center gap-1.5 text-rose-400">
              <Terminal className="w-3.5 h-3.5" />
              <span>Fault Isolation Status</span>
            </span>
            <span className="text-slate-500">Auto-Contained</span>
          </div>
          <div className="font-mono text-xs text-slate-400 space-y-1">
            <div>&gt; State: Render boundary caught unhandled anomaly.</div>
            <div>&gt; Security: Zero credential or schema leak.</div>
            <div className="text-cyan-400">&gt; Recommended action: Re-initialize subsystem or return home.</div>
          </div>
        </GlassCard>

        {/* Navigation Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleRetry}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-heading font-semibold text-xs shadow-accent-cyan transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Re-initialize Subsystem</span>
          </button>
          
          <button
            type="button"
            onClick={() => onSelectTab('home')}
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-900/80 border border-white/10 hover:border-white/20 text-slate-300 hover:text-white font-mono text-xs transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4 text-slate-400" />
            <span>Return to Campus Hub</span>
          </button>
        </div>

      </div>
    </div>
  );
};
