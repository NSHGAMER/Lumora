import React from 'react';
import { ShieldAlert, Home, Lock, KeyRound } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { Badge } from '../ui/Badge';
import type { ActiveTab } from '../../types';

interface Error403ViewProps {
  onSelectTab: (tab: ActiveTab) => void;
}

export const Error403View: React.FC<Error403ViewProps> = ({ onSelectTab }) => {
  return (
    <div className="pt-28 pb-20 px-4 sm:px-6 min-h-[85vh] flex items-center justify-center">
      <div className="max-w-xl w-full text-center space-y-8">
        
        {/* Shield Icon Animation */}
        <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-amber-500/10 border border-amber-500/20 animate-pulse" />
          <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0A1019] to-slate-900 border border-amber-500/30 flex items-center justify-center shadow-lg shadow-amber-500/10">
            <Lock className="w-8 h-8 text-amber-400" />
          </div>
        </div>

        {/* Code & Title */}
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-2">
            <Badge variant="amber" pulse>
              <span>Code 403</span>
            </Badge>
            <span className="text-xs font-mono text-slate-500">
              Security Clearance Insufficient
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-heading font-bold text-white tracking-tight">
            Access Restricted.
          </h1>
          <p className="text-slate-400 font-sans text-sm sm:text-base max-w-md mx-auto leading-relaxed">
            Your current institutional role does not have authorization clearance to view or execute actions on this campus node.
          </p>
        </div>

        {/* Security Info Card */}
        <GlassCard interactive={false} glowColor="none" className="text-left space-y-3 p-5 border-amber-500/20">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 border-b border-white/5 pb-2">
            <span className="flex items-center gap-1.5 text-amber-400">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>RBAC Boundary Enforcement</span>
            </span>
            <span className="text-slate-500">Policy: Active</span>
          </div>
          <p className="text-xs font-mono text-slate-400 leading-relaxed">
            Lumora maintains strict role-based data partitions. If you require access to administrative registers or faculty consoles, request role elevation through your department dean or campus IT registrar.
          </p>
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
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-900/80 border border-white/10 hover:border-amber-500/30 text-slate-300 hover:text-white font-mono text-xs transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <KeyRound className="w-4 h-4 text-amber-400" />
            <span>Active Role Dashboard</span>
          </button>
        </div>

      </div>
    </div>
  );
};
