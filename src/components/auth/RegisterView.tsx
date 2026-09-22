import React, { useState } from 'react';
import { UserPlus, Mail, Lock, User, Eye, EyeOff, ArrowRight, ShieldCheck, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { useAuth } from '../../auth';
import { GlassCard } from '../ui/GlassCard';
import { Badge } from '../ui/Badge';
import type { ActiveTab, SystemRole } from '../../types';

interface RegisterViewProps {
  onSelectTab: (tab: ActiveTab) => void;
}

export const RegisterView: React.FC<RegisterViewProps> = ({ onSelectTab }) => {
  const { register } = useAuth();
  const [institutionalId, setInstitutionalId] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<SystemRole>('student');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Password strength calculations
  const hasLength = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const passwordsMatch = password && confirmPassword && password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!institutionalId.trim() || !fullName.trim() || !email.trim() || !password || !confirmPassword) {
      setErrorMessage('Please complete all registration fields.');
      return;
    }

    if (institutionalId.trim().length < 3) {
      setErrorMessage('Institutional identifier must be at least 3 characters long.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMessage('Please enter a valid institutional email address.');
      return;
    }

    if (!hasLength) {
      setErrorMessage('Password must be at least 8 characters in length.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Password confirmation does not match.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await register({
        institutionalId: institutionalId.trim(),
        fullName,
        email,
        password,
        confirmPassword,
        role,
      });

      if (result.success) {
        setSuccessMessage('Account registered successfully! Redirecting to sign in...');
        setTimeout(() => {
          onSelectTab('login');
        }, 1500);
      } else if (result.error) {
        setErrorMessage(result.error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="pt-28 pb-20 px-4 sm:px-6 min-h-[85vh] flex items-center justify-center">
      <div className="max-w-xl w-full space-y-8">
        
        {/* Header Title */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-2">
            <Badge variant="cyan" pulse>
              <UserPlus className="w-3 h-3" />
              <span>Campus Account Provisioning</span>
            </Badge>
          </div>
          <h1 className="text-3xl sm:text-4xl font-heading font-bold text-white tracking-tight">
            Create Your Lumora Profile
          </h1>
          <p className="text-slate-400 font-sans text-xs sm:text-sm max-w-md mx-auto">
            Establish your identity within the Intelligent Campus Operating System.
          </p>
        </div>

        {/* Immediate Activation Direct Banner */}
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3 text-xs font-mono text-emerald-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-semibold text-white flex items-center gap-2">
              <span>Immediate Account Activation</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Zero SMTP Required
              </span>
            </div>
            <p className="text-slate-300 text-xs leading-relaxed">
              Your account becomes active instantly upon registration. No waiting for verification emails, activation tokens, or external confirmation delays.
            </p>
          </div>
        </div>

        {/* Registration Form Card */}
        <GlassCard interactive={false} glowColor="cyan" className="p-6 sm:p-8 space-y-6 border-cyan-500/20">
          
          {successMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-start gap-2.5 text-xs font-mono text-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{successMessage}</div>
            </div>
          )}

          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-start gap-2.5 text-xs font-mono text-rose-300">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{errorMessage}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Institutional Identifier */}
            <div className="space-y-1.5">
              <label htmlFor="reg-institutional-id" className="block text-xs font-mono text-slate-300 font-medium">
                Institutional ID (Student ID or Faculty ID)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <input
                  id="reg-institutional-id"
                  type="text"
                  autoComplete="off"
                  value={institutionalId}
                  onChange={(e) => setInstitutionalId(e.target.value)}
                  placeholder="e.g. STU-2026-001 or FAC-102"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 hover:border-white/20 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 text-white font-mono text-xs placeholder:text-slate-600 transition-all"
                />
              </div>
            </div>

            {/* Full Name */}
            <div className="space-y-1.5">
              <label htmlFor="reg-fullname" className="block text-xs font-mono text-slate-300 font-medium">
                Full Legal Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="reg-fullname"
                  type="text"
                  autoComplete="name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Alex Chen"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 hover:border-white/20 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 text-white font-mono text-xs placeholder:text-slate-600 transition-all"
                />
              </div>
            </div>

            {/* Institutional Email */}
            <div className="space-y-1.5">
              <label htmlFor="reg-email" className="block text-xs font-mono text-slate-300 font-medium">
                Institutional Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="reg-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@university.edu"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 hover:border-white/20 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 text-white font-mono text-xs placeholder:text-slate-600 transition-all"
                />
              </div>
            </div>

            {/* Role Selection */}
            <div className="space-y-1.5">
              <label className="block text-xs font-mono text-slate-300 font-medium">
                Campus Role Designation
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('student')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    role === 'student'
                      ? 'bg-cyan-500/10 border-cyan-400 text-white shadow-accent-cyan'
                      : 'bg-white/[0.02] border-white/10 text-slate-400 hover:border-white/20'
                  }`}
                >
                  <div className="text-xs font-mono font-semibold">Student</div>
                  <div className="text-[10px] text-slate-500">Curricula & Schedules</div>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('faculty')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    role === 'faculty'
                      ? 'bg-purple-500/10 border-purple-400 text-white shadow-accent-purple'
                      : 'bg-white/[0.02] border-white/10 text-slate-400 hover:border-white/20'
                  }`}
                >
                  <div className="text-xs font-mono font-semibold">Faculty</div>
                  <div className="text-[10px] text-slate-500">Courses & Advisory</div>
                </button>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-mono text-slate-500 pt-1">
                <Info className="w-3 h-3" />
                <span>Administrator accounts require institutional registrar provisioning.</span>
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label htmlFor="reg-password" aria-label="Create Password" className="block text-xs font-mono text-slate-300 font-medium">
                Create Strong Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
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
              <label htmlFor="reg-confirm-password" aria-label="Confirm Password" className="block text-xs font-mono text-slate-300 font-medium">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <input
                  id="reg-confirm-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 hover:border-white/20 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 text-white font-mono text-xs placeholder:text-slate-600 transition-all"
                />
              </div>
            </div>

            {/* Password Validation Requirements */}
            <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 space-y-1.5 text-[11px] font-mono">
              <div className="text-slate-400 font-medium">Password Requirements:</div>
              <div className="grid grid-cols-2 gap-2 text-slate-400">
                <div className={`flex items-center gap-1.5 ${hasLength ? 'text-emerald-400' : 'text-slate-500'}`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  <span>8+ characters</span>
                </div>
                <div className={`flex items-center gap-1.5 ${hasNumber ? 'text-emerald-400' : 'text-slate-500'}`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  <span>At least 1 number</span>
                </div>
                <div className={`flex items-center gap-1.5 ${hasSpecial ? 'text-emerald-400' : 'text-slate-500'}`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  <span>Special symbol</span>
                </div>
                <div className={`flex items-center gap-1.5 ${passwordsMatch ? 'text-emerald-400' : 'text-slate-500'}`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  <span>Passwords match</span>
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
                  <span>Provisioning Account Node...</span>
                </>
              ) : (
                <>
                  <span>Create Account & Activate Immediately</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

        </GlassCard>

        {/* Existing Account Link */}
        <div className="text-center text-xs font-mono text-slate-400">
          Already have an active campus profile?{' '}
          <button
            type="button"
            onClick={() => onSelectTab('login')}
            className="text-cyan-400 hover:text-cyan-300 underline underline-offset-4 cursor-pointer"
          >
            Sign In Here →
          </button>
        </div>

      </div>
    </div>
  );
};
