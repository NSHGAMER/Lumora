import React from 'react';
import { Lock, ArrowRight, ShieldAlert } from 'lucide-react';
import { useAuth } from './useAuth';
import { GlassCard } from '../components/ui/GlassCard';
import { Badge } from '../components/ui/Badge';
import { SkeletonDashboard } from '../components/ui/skeleton';
import type { ActiveTab, SystemRole } from '../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  onSelectTab: (tab: ActiveTab) => void;
  requiredRole?: SystemRole;
  fallbackTitle?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  onSelectTab,
  requiredRole,
  fallbackTitle = 'Institutional Authentication Required',
}) => {
  const { user, status } = useAuth();

  // Loading state while checking session
  if (status === 'loading') {
    return (
      <div className="pt-28 pb-20 px-4 sm:px-6 max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Badge variant="cyan" pulse>
            <span>Verifying Session Clearance</span>
          </Badge>
        </div>
        <SkeletonDashboard />
      </div>
    );
  }

  // If not authenticated, present an intuitive access challenge card directing to login
  if (status === 'unauthenticated' || !user) {
    return (
      <div className="pt-28 pb-20 px-4 sm:px-6 min-h-[75vh] flex items-center justify-center">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-cyan-500/10 border border-cyan-500/20 animate-pulse" />
            <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0A1019] to-slate-900 border border-cyan-500/30 flex items-center justify-center shadow-accent-cyan">
              <Lock className="w-6 h-6 text-cyan-400" />
            </div>
          </div>

          <div className="space-y-2">
            <Badge variant="cyan">
              <span>Security Boundary</span>
            </Badge>
            <h2 className="text-2xl font-heading font-bold text-white tracking-tight">
              {fallbackTitle}
            </h2>
            <p className="text-slate-400 font-sans text-xs sm:text-sm max-w-sm mx-auto leading-relaxed">
              This node requires verified campus credentials to establish session continuity. Please sign in to access your institutional profile and services.
            </p>
          </div>

          <GlassCard interactive={false} glowColor="cyan" className="p-4 border-cyan-500/20 text-left text-xs font-mono text-slate-400 space-y-1">
            <div className="text-slate-300 font-medium">Session Policy:</div>
            <div>&gt; Immediate account activation upon registration.</div>
            <div>&gt; Zero email verification or SMTP dependencies.</div>
          </GlassCard>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => onSelectTab('login')}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-heading font-semibold text-xs shadow-accent-cyan transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Sign In to Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onSelectTab('home')}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 hover:border-white/20 text-slate-400 hover:text-white font-mono text-xs transition-all cursor-pointer"
            >
              Return Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Role clearance check (frontend advisory gate; authoritative check enforced by FastAPI backend in Phase 2B)
  if (requiredRole && user.role !== requiredRole && user.role !== 'admin') {
    return (
      <div className="pt-28 pb-20 px-4 sm:px-6 min-h-[75vh] flex items-center justify-center">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="relative mx-auto w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
            <ShieldAlert className="w-8 h-8 text-amber-400" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-heading font-bold text-white tracking-tight">
              Role Elevation Required
            </h2>
            <p className="text-slate-400 font-sans text-xs sm:text-sm">
              Your active role (<span className="text-cyan-400 font-mono capitalize">{user.role}</span>) does not match the required <span className="text-amber-300 font-mono capitalize">{requiredRole}</span> role for this section.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onSelectTab('account')}
            className="px-5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-slate-300 hover:text-white font-mono text-xs transition-all cursor-pointer"
          >
            Manage Account & Roles
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
