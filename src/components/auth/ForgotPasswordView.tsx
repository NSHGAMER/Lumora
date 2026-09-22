import React, { useState } from 'react';
import { KeyRound, Mail, ArrowLeft, ArrowRight, ShieldCheck, Info, Building } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { Badge } from '../ui/Badge';
import type { ActiveTab } from '../../types';

interface ForgotPasswordViewProps {
  onSelectTab: (tab: ActiveTab) => void;
}

export const ForgotPasswordView: React.FC<ForgotPasswordViewProps> = ({ onSelectTab }) => {
  const [identifier, setIdentifier] = useState('');
  const [hasRequested, setHasRequested] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) return;
    setHasRequested(true);
  };

  return (
    <div className="pt-28 pb-20 px-4 sm:px-6 min-h-[85vh] flex items-center justify-center">
      <div className="max-w-md w-full space-y-8">
        
        {/* Header Title */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-2">
            <Badge variant="blue" pulse>
              <KeyRound className="w-3 h-3" />
              <span>Identity Recovery Protocol</span>
            </Badge>
          </div>
          <h1 className="text-3xl sm:text-4xl font-heading font-bold text-white tracking-tight">
            Password Recovery
          </h1>
          <p className="text-slate-400 font-sans text-xs sm:text-sm max-w-sm mx-auto">
            Institutional credential restoration guidelines and access recovery procedures.
          </p>
        </div>

        {/* Strict SMTP Policy Card */}
        <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs font-mono text-blue-300 flex items-start gap-3">
          <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-semibold text-white">No-SMTP Security Architecture:</div>
            <p className="text-slate-300 text-xs leading-relaxed">
              Lumora does not send automated password-reset emails or rely on unauthenticated SMTP recovery channels. Identity recovery is verified through official institutional channels.
            </p>
          </div>
        </div>

        <GlassCard interactive={false} glowColor="cyan" className="p-6 sm:p-8 space-y-6 border-cyan-500/20">
          
          {!hasRequested ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label htmlFor="recovery-id" className="block text-xs font-mono text-slate-300 font-medium">
                  Institutional ID or Registered Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="recovery-id"
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="e.g. STU-8841 or user@lumora.edu"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 hover:border-white/20 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 text-white font-mono text-xs placeholder:text-slate-600 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-heading font-semibold text-xs shadow-accent-cyan transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Check Institutional Recovery Clearance</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            /* Institutional Clearance Notice — Does not claim email was sent! */
            <div className="space-y-4 text-xs font-mono">
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 space-y-2">
                <div className="font-semibold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Recovery Query Registered</span>
                </div>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Query recorded for institutional identifier <span className="text-cyan-300 font-bold">{identifier}</span>.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2 text-slate-400 text-xs">
                <div className="font-semibold text-white flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Institutional Recovery Options:</span>
                </div>
                <ul className="list-disc list-inside space-y-1 pl-1 text-slate-300">
                  <li><strong>Registrar Helpdesk:</strong> Present your physical Student/Faculty Smartcard at Building 04 (IT Support).</li>
                  <li><strong>Department Dean Elevation:</strong> Request a temporary reset authorization code from your faculty advisor.</li>
                  <li><strong>Direct Password Reset:</strong> If you hold an authorized clearance code, proceed to the reset console.</li>
                </ul>
              </div>

              <button
                type="button"
                onClick={() => onSelectTab('reset-password')}
                className="w-full py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 text-cyan-300 font-mono text-xs transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Enter Reset Authorization Console →</span>
              </button>
            </div>
          )}

          <div className="pt-4 border-t border-white/5 text-center">
            <button
              type="button"
              onClick={() => onSelectTab('login')}
              className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Sign In</span>
            </button>
          </div>

        </GlassCard>

      </div>
    </div>
  );
};
