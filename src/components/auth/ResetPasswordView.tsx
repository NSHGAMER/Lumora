import React, { useState } from 'react';
import { Lock, KeyRound, Eye, EyeOff, ArrowRight, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { Badge } from '../ui/Badge';
import type { ActiveTab } from '../../types';

interface ResetPasswordViewProps {
  onSelectTab: (tab: ActiveTab) => void;
}

export const ResetPasswordView: React.FC<ResetPasswordViewProps> = ({ onSelectTab }) => {
  const [recoveryCode, setRecoveryCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const hasLength = newPassword.length >= 8;
  const hasNumber = /\d/.test(newPassword);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);
  const passwordsMatch = newPassword && confirmPassword && newPassword === confirmPassword;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!newPassword || !confirmPassword) {
      setErrorMessage('Please complete all required fields.');
      return;
    }

    if (!hasLength) {
      setErrorMessage('Password must be at least 8 characters.');
      return;
    }

    if (!passwordsMatch) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
    }, 800);
  };

  return (
    <div className="pt-28 pb-20 px-4 sm:px-6 min-h-[85vh] flex items-center justify-center">
      <div className="max-w-md w-full space-y-8">
        
        {/* Header Title */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-2">
            <Badge variant="cyan" pulse>
              <KeyRound className="w-3 h-3" />
              <span>Credential Reset Console</span>
            </Badge>
          </div>
          <h1 className="text-3xl sm:text-4xl font-heading font-bold text-white tracking-tight">
            Reset Password
          </h1>
          <p className="text-slate-400 font-sans text-xs sm:text-sm max-w-sm mx-auto">
            Establish a new cryptographic password for your institutional profile.
          </p>
        </div>

        <GlassCard interactive={false} glowColor="cyan" className="p-6 sm:p-8 space-y-6 border-cyan-500/20">
          
          {isSuccess ? (
            <div className="space-y-6 text-center">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-accent-cyan">
                <CheckCircle2 className="w-7 h-7 text-emerald-400" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-heading font-semibold text-white">
                  Password Updated
                </h3>
                <p className="text-xs font-mono text-slate-400 leading-relaxed">
                  Your institutional credential has been updated. You may now authenticate with your new password.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onSelectTab('login')}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-heading font-semibold text-xs shadow-accent-cyan transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Proceed to Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-start gap-2.5 text-xs font-mono text-rose-300">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>{errorMessage}</div>
                </div>
              )}

              {/* Clearance Code Field */}
              <div className="space-y-1.5">
                <label htmlFor="recovery-code" className="block text-xs font-mono text-slate-300 font-medium">
                  Institutional Clearance Code (Optional Placeholder)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    id="recovery-code"
                    type="text"
                    value={recoveryCode}
                    onChange={(e) => setRecoveryCode(e.target.value)}
                    placeholder="e.g. REG-8841-CLR"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 hover:border-white/20 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 text-white font-mono text-xs placeholder:text-slate-600 transition-all"
                  />
                </div>
              </div>

              {/* New Password Field */}
              <div className="space-y-1.5">
                <label htmlFor="reset-new-password" aria-label="New Password" className="block text-xs font-mono text-slate-300 font-medium">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="reset-new-password"
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 hover:border-white/20 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 text-white font-mono text-xs placeholder:text-slate-600 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-1.5">
                <label htmlFor="reset-confirm-password" aria-label="Confirm New Password" className="block text-xs font-mono text-slate-300 font-medium">
                  Confirm New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <input
                    id="reset-confirm-password"
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 hover:border-white/20 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 text-white font-mono text-xs placeholder:text-slate-600 transition-all"
                  />
                </div>
              </div>

              {/* Password Checklist */}
              <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 space-y-1.5 text-[11px] font-mono">
                <div className="text-slate-400 font-medium">Password Criteria:</div>
                <div className="grid grid-cols-2 gap-2 text-slate-400">
                  <div className={`flex items-center gap-1.5 ${hasLength ? 'text-emerald-400' : 'text-slate-500'}`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    <span>8+ characters</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasNumber ? 'text-emerald-400' : 'text-slate-500'}`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    <span>1+ number</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasSpecial ? 'text-emerald-400' : 'text-slate-500'}`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    <span>Special character</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${passwordsMatch ? 'text-emerald-400' : 'text-slate-500'}`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    <span>Matches</span>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 disabled:opacity-50 text-white font-heading font-semibold text-xs shadow-accent-cyan transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Updating Credentials...</span>
                  </>
                ) : (
                  <>
                    <span>Commit New Password</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

            </form>
          )}

        </GlassCard>

      </div>
    </div>
  );
};
