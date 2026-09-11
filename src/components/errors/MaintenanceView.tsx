import React from 'react';
import { Wrench, Clock, RefreshCw, Home, Cpu } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { Badge } from '../ui/Badge';
import type { ActiveTab } from '../../types';

interface MaintenanceViewProps {
  onSelectTab: (tab: ActiveTab) => void;
}

export const MaintenanceView: React.FC<MaintenanceViewProps> = ({ onSelectTab }) => {
  return (
    <div className="pt-28 pb-20 px-4 sm:px-6 min-h-[85vh] flex items-center justify-center">
      <div className="max-w-2xl w-full text-center space-y-8">
        
        {/* Maintenance Node Pulse Animation */}
        <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-cyan-500/15 border border-cyan-500/30 animate-pulse" />
          <div className="absolute -inset-3 rounded-full bg-blue-500/10 border border-blue-500/20 animate-spin-slow" />
          <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0A1019] to-slate-900 border border-cyan-500/40 flex items-center justify-center shadow-accent-cyan">
            <Cpu className="w-8 h-8 text-cyan-400" />
          </div>
        </div>

        {/* Code & Title */}
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-2">
            <Badge variant="cyan" pulse>
              <Wrench className="w-3 h-3" />
              <span>Campus OS Sync in Progress</span>
            </Badge>
            <span className="text-xs font-mono text-slate-500">
              Protocol: OS-MAINT-NODE
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-heading font-bold text-white tracking-tight">
            Institutional Maintenance
          </h1>
          <p className="text-slate-400 font-sans text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
            Lumora core services are undergoing scheduled infrastructure synchronization, database indexing, and node telemetry calibrations.
          </p>
        </div>

        {/* Status Window Card */}
        <GlassCard interactive={false} glowColor="cyan" className="text-left space-y-4 p-6 border-cyan-500/20">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 border-b border-white/5 pb-3">
            <span className="flex items-center gap-2 text-cyan-400 font-medium">
              <Clock className="w-4 h-4" />
              <span>Operational Window Placeholder</span>
            </span>
            <span className="text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Telemetry Intact
            </span>
          </div>

          <div className="space-y-2 text-xs font-mono text-slate-300">
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
              <div className="text-slate-400">Status Notice:</div>
              <p className="text-slate-300 leading-relaxed">
                [Estimated Maintenance Window: Scheduled institutional sync placeholder | All campus nodes will automatically resume upon completion of verification checks]
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
              <div className="p-2.5 rounded-lg bg-slate-900/60 border border-white/5 space-y-0.5">
                <span className="text-[10px] text-slate-500">Node Database</span>
                <div className="text-xs text-cyan-400">Indexing Tables</div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/60 border border-white/5 space-y-0.5">
                <span className="text-[10px] text-slate-500">JSR Neural Core</span>
                <div className="text-xs text-purple-400">Model Warmup</div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/60 border border-white/5 space-y-0.5">
                <span className="text-[10px] text-slate-500">Campus Sensors</span>
                <div className="text-xs text-emerald-400">Operational</div>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Navigation Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-heading font-semibold text-xs shadow-accent-cyan transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Check Node Status</span>
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
