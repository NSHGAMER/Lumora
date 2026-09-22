import React, { useState } from 'react';
import { Lock, Mail, Eye, EyeOff, ArrowRight, Shield, Sparkles, AlertCircle } from 'lucide-react';
import { useAuth } from '../../auth';
import { GlassCard } from '../ui/GlassCard';
import { Badge } from '../ui/Badge';
import type { ActiveTab } from '../../types';

interface LoginViewProps {
  onSelectTab: (tab: ActiveTab) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onSelectTab }) => {
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!identifier.trim()) {
      setErrorMessage('Please enter your institutional email or Student ID.');
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your account password.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await login({ identifier, password, rememberMe });
      if (!result.success && result.error) {
        setErrorMessage(result.error);
      } else {
        onSelectTab('account');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (role: 'student' | 'faculty') => {
    setErrorMessage(null);
    setIsLoading(true);
    try {
      const demoId = role === 'faculty' ? 'faculty.sarah@lumora.edu' : 'alex.chen@lumora.edu';
      const result = await login({ identifier: demoId, password: 'demo-password-2026' }, true);
      if (result.success) {
        onSelectTab('account');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="pt-28 pb-20 px-4 sm:px-6 min-h-[85vh] flex items-center justify-center">
      <div className="max-w-md w-full space-y-8">
        
        {/* Header Branding */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-2">
            <Badge variant="cyan" pulse>
              <Shield className="w-3 h-3" />
              <span>Campus Security Clearance</span>
            </Badge>
          </div>
          <h1 className="text-3xl sm:text-4xl font-heading font-bold text-white tracking-tight">
            Sign In to Lumora
          </h1>
          <p className="text-slate-400 font-sans text-xs sm:text-sm">
            Access your unified campus console, academic schedules, and JSR AI co-pilot.
          </p>
        </div>

        {/* Phase 2A Architectural Notice */}
        <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs font-mono text-blue-300 flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-semibold text-white">Phase 2A Frontend Architecture:</span>
            <p className="text-slate-300 text-xs leading-relaxed">
              FastAPI backend connection will activate in Phase 2B. Test the UI below or use the one-click demo profiles.
            </p>
          </div>
        </div>

        {/* Login Form Card */}
        <GlassCard interactive={false} glowColor="cyan" className="p-6 sm:p-8 space-y-6 border-cyan-500/20">
          
          {/* Error Message Banner */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-start gap-2.5 text-xs font-mono text-rose-300">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{errorMessage}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Identifier Field */}
            <div className="space-y-1.5">
              <label htmlFor="login-identifier" className="block text-xs font-mono text-slate-300 font-medium">
                Institutional Email or Student ID
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="login-identifier"
                  type="text"
                  autoComplete="username"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. s.vance@lumora.edu or STU-8841"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 hover:border-white/20 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 text-white font-mono text-xs placeholder:text-slate-600 transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="login-password" aria-label="Account Password" className="block text-xs font-mono text-slate-300 font-medium">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => onSelectTab('forgot-password')}
                  className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded bg-slate-900 border-white/10 text-cyan-500 focus:ring-cyan-500/40 cursor-pointer"
                />
                <span>Remember session</span>
              </label>
              <span className="text-[11px] text-slate-500">JWT Stateless</span>
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
                  <span>Verifying Node Clearance...</span>
                </>
              ) : (
                <>
                  <span>Authenticate Session</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Demo Profiles One-Click Selector */}
          <div className="pt-4 border-t border-white/5 space-y-2.5">
            <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider text-center">
              Quick UI Preview Demo Profiles
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemoLogin('student')}
                disabled={isLoading}
                className="p-2.5 rounded-lg bg-white/[0.02] hover:bg-cyan-500/10 border border-white/5 hover:border-cyan-500/30 text-left transition-all cursor-pointer group"
              >
                <div className="text-xs font-mono font-medium text-white group-hover:text-cyan-300">
                  Student Demo
                </div>
                <div className="text-[10px] font-mono text-slate-500">Alex Chen (Eng)</div>
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('faculty')}
                disabled={isLoading}
                className="p-2.5 rounded-lg bg-white/[0.02] hover:bg-purple-500/10 border border-white/5 hover:border-purple-500/30 text-left transition-all cursor-pointer group"
              >
                <div className="text-xs font-mono font-medium text-white group-hover:text-purple-300">
                  Faculty Demo
                </div>
                <div className="text-[10px] font-mono text-slate-500">Dr. Sarah Vance</div>
              </button>
            </div>
          </div>

        </GlassCard>

        {/* Sign Up Redirect */}
        <div className="text-center text-xs font-mono text-slate-400">
          New to Lumora Campus OS?{' '}
          <button
            type="button"
            onClick={() => onSelectTab('register')}
            className="text-cyan-400 hover:text-cyan-300 underline underline-offset-4 cursor-pointer"
          >
            Create an Account →
          </button>
        </div>

      </div>
    </div>
  );
};
