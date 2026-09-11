import React, { useState } from 'react';
import {
  User,
  Shield,
  KeyRound,
  Sliders,
  LogOut,
  Moon,
  Sun,
  Monitor,
  CheckCircle2,
  AlertCircle,
  Bell,
  Laptop,
  Check,
} from 'lucide-react';
import { useAuth, ProtectedRoute } from '../../auth';
import { GlassCard } from '../ui/GlassCard';
import { Badge } from '../ui/Badge';
import type { ActiveTab } from '../../types';

interface AccountSettingsViewProps {
  onSelectTab: (tab: ActiveTab) => void;
}

export const AccountSettingsView: React.FC<AccountSettingsViewProps> = ({ onSelectTab }) => {
  const { user, logout, theme, setTheme, changePassword, updateProfile, isMockSession } = useAuth();
  const [activeSection, setActiveSection] = useState<'profile' | 'security' | 'preferences'>('profile');

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Profile edit state
  const [department, setDepartment] = useState(user?.department || 'Undergraduate Sciences');
  const [profileSaved, setProfileSaved] = useState(false);

  // Notification preferences placeholder
  const [urgentAlerts, setUrgentAlerts] = useState(true);
  const [courseUpdates, setCourseUpdates] = useState(true);
  const [jsrSummaries, setJsrSummaries] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordStatus(null);
    setIsChangingPassword(true);

    try {
      const result = await changePassword({ currentPassword, newPassword, confirmPassword });
      if (result.success) {
        setPasswordStatus({ type: 'success', message: 'Password updated successfully.' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordStatus({ type: 'error', message: result.error || 'Failed to update password.' });
      }
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({ department });
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  };

  const handleLogout = () => {
    logout();
    onSelectTab('home');
  };

  return (
    <ProtectedRoute onSelectTab={onSelectTab} fallbackTitle="Account Console Restricted">
      <div className="pt-28 pb-20 px-4 sm:px-6 max-w-5xl mx-auto space-y-8">
        
        {/* Header Title with User Avatar & Role */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 p-0.5 shadow-accent-cyan shrink-0">
              <div className="w-full h-full rounded-[14px] bg-[#0A1019] flex items-center justify-center font-heading font-bold text-lg text-white">
                {user?.name.charAt(0) || 'U'}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-heading font-bold text-white tracking-tight">
                  {user?.name}
                </h1>
                <Badge variant={user?.role === 'faculty' ? 'purple' : 'cyan'}>
                  <span className="capitalize">{user?.role}</span>
                </Badge>
              </div>
              <p className="text-xs font-mono text-slate-400">
                {user?.email} • {user?.studentId || 'Faculty Node'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isMockSession && (
              <span className="text-[10px] font-mono px-2 py-1 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                UI Preview Mode
              </span>
            )}
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-300 hover:text-rose-200 text-xs font-mono transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-900/60 border border-white/5 w-fit">
          <button
            type="button"
            onClick={() => setActiveSection('profile')}
            className={`px-4 py-2 rounded-lg text-xs font-mono font-medium transition-all flex items-center gap-2 cursor-pointer ${
              activeSection === 'profile'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-accent-cyan'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Profile</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('security')}
            className={`px-4 py-2 rounded-lg text-xs font-mono font-medium transition-all flex items-center gap-2 cursor-pointer ${
              activeSection === 'security'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-accent-cyan'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Security & Sessions</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('preferences')}
            className={`px-4 py-2 rounded-lg text-xs font-mono font-medium transition-all flex items-center gap-2 cursor-pointer ${
              activeSection === 'preferences'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-accent-cyan'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Theme & Telemetry</span>
          </button>
        </div>

        {/* SECTION 1: PROFILE */}
        {activeSection === 'profile' && (
          <div className="space-y-6">
            <GlassCard interactive={false} glowColor="cyan" className="p-6 space-y-6 border-cyan-500/20">
              <div className="flex items-center justify-between pb-4 border-b border-white/5">
                <div>
                  <h2 className="text-lg font-heading font-semibold text-white">
                    Institutional Identity
                  </h2>
                  <p className="text-xs font-mono text-slate-400">
                    Profile parameters bound to your campus operating node.
                  </p>
                </div>
                {profileSaved && (
                  <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5 animate-fadeIn">
                    <CheckCircle2 className="w-4 h-4" />
                    Changes Saved
                  </span>
                )}
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4 font-mono text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-slate-400">Full Name</label>
                    <input
                      type="text"
                      disabled
                      value={user?.name || ''}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-slate-400 cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-400">Institutional Email</label>
                    <input
                      type="email"
                      disabled
                      value={user?.email || ''}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-slate-400 cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-400">Campus Role Clearance</label>
                    <input
                      type="text"
                      disabled
                      value={user?.role?.toUpperCase() || ''}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-cyan-400 cursor-not-allowed font-bold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-300">Department / Division</label>
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 hover:border-white/20 focus:border-cyan-400 focus:outline-none text-white transition-all"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-heading font-semibold text-xs shadow-accent-cyan transition-all cursor-pointer flex items-center gap-2"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Save Profile Changes</span>
                  </button>
                </div>
              </form>
            </GlassCard>
          </div>
        )}

        {/* SECTION 2: SECURITY */}
        {activeSection === 'security' && (
          <div className="space-y-6">
            {/* Password Change Card */}
            <GlassCard interactive={false} glowColor="none" className="p-6 space-y-6">
              <div className="pb-4 border-b border-white/5">
                <h2 className="text-lg font-heading font-semibold text-white flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-cyan-400" />
                  <span>In-Session Password Change</span>
                </h2>
                <p className="text-xs font-mono text-slate-400">
                  Secure authenticated password update without external SMTP dependency.
                </p>
              </div>

              {passwordStatus && (
                <div
                  className={`p-3.5 rounded-xl border flex items-center gap-2.5 text-xs font-mono ${
                    passwordStatus.type === 'success'
                      ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                      : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
                  }`}
                >
                  {passwordStatus.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  )}
                  <span>{passwordStatus.message}</span>
                </div>
              )}

              <form onSubmit={handlePasswordChange} className="space-y-4 font-mono text-xs max-w-md">
                <div className="space-y-1.5">
                  <label className="text-slate-300">Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 hover:border-white/20 focus:border-cyan-400 focus:outline-none text-white transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-300">New Password (8+ characters)</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 hover:border-white/20 focus:border-cyan-400 focus:outline-none text-white transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-300">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 hover:border-white/20 focus:border-cyan-400 focus:outline-none text-white transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 disabled:opacity-50 text-white font-heading font-semibold text-xs shadow-accent-cyan transition-all cursor-pointer flex items-center gap-2"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Update Password</span>
                </button>
              </form>
            </GlassCard>

            {/* Active Sessions Placeholder */}
            <GlassCard interactive={false} glowColor="none" className="p-6 space-y-4">
              <div className="pb-3 border-b border-white/5">
                <h2 className="text-lg font-heading font-semibold text-white flex items-center gap-2">
                  <Laptop className="w-4 h-4 text-cyan-400" />
                  <span>Active Session Clearance</span>
                </h2>
                <p className="text-xs font-mono text-slate-400">
                  Devices authenticated with your institutional profile.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between font-mono text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <Laptop className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-white font-medium flex items-center gap-2">
                      <span>Current Browser Session</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        Active Node
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Vite Client • IP Masked • TLS 1.3
                    </div>
                  </div>
                </div>
                <span className="text-slate-500 text-[11px]">Sub-second Heartbeat</span>
              </div>
            </GlassCard>
          </div>
        )}

        {/* SECTION 3: PREFERENCES & THEME */}
        {activeSection === 'preferences' && (
          <div className="space-y-6">
            
            {/* Theme Preferences */}
            <GlassCard interactive={false} glowColor="cyan" className="p-6 space-y-4 border-cyan-500/20">
              <div className="pb-3 border-b border-white/5">
                <h2 className="text-lg font-heading font-semibold text-white flex items-center gap-2">
                  <Moon className="w-4 h-4 text-cyan-400" />
                  <span>Theme & Aesthetic Palette</span>
                </h2>
                <p className="text-xs font-mono text-slate-400">
                  Lumora default is Futuristic Dark Space. Light mode inherits all design tokens without altering structure.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                    theme === 'dark'
                      ? 'bg-cyan-500/15 border-cyan-400 text-white shadow-accent-cyan'
                      : 'bg-white/[0.02] border-white/10 text-slate-400 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-2 text-xs font-mono font-semibold text-white">
                    <Moon className="w-4 h-4 text-cyan-400" />
                    <span>Dark Mode</span>
                    {theme === 'dark' && <span className="text-[10px] text-cyan-400">(Default)</span>}
                  </div>
                  <p className="text-[11px] font-mono text-slate-500 pt-1">
                    Cosmic dark slate, laser borders, neon conduits.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                    theme === 'light'
                      ? 'bg-blue-500/15 border-blue-400 text-white shadow-accent-cyan'
                      : 'bg-white/[0.02] border-white/10 text-slate-400 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-2 text-xs font-mono font-semibold text-white">
                    <Sun className="w-4 h-4 text-blue-400" />
                    <span>Light Mode</span>
                  </div>
                  <p className="text-[11px] font-mono text-slate-500 pt-1">
                    Frosted iced glass, crisp dark text, high contrast.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setTheme('system')}
                  className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                    theme === 'system'
                      ? 'bg-purple-500/15 border-purple-400 text-white shadow-accent-purple'
                      : 'bg-white/[0.02] border-white/10 text-slate-400 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-2 text-xs font-mono font-semibold text-white">
                    <Monitor className="w-4 h-4 text-purple-400" />
                    <span>System Sync</span>
                  </div>
                  <p className="text-[11px] font-mono text-slate-500 pt-1">
                    Follows your operating system preference.
                  </p>
                </button>
              </div>
            </GlassCard>

            {/* Notification Preferences Placeholder */}
            <GlassCard interactive={false} glowColor="none" className="p-6 space-y-4">
              <div className="pb-3 border-b border-white/5">
                <h2 className="text-lg font-heading font-semibold text-white flex items-center gap-2">
                  <Bell className="w-4 h-4 text-purple-400" />
                  <span>Telemetry Notification Channels</span>
                </h2>
                <p className="text-xs font-mono text-slate-400">
                  Institutional alerts routed via in-app feeds and n8n webhooks.
                </p>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <label className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 cursor-pointer">
                  <div>
                    <div className="text-white font-medium">Urgent Campus Alerts</div>
                    <div className="text-[11px] text-slate-500">Security bulletins and severe weather alerts</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={urgentAlerts}
                    onChange={(e) => setUrgentAlerts(e.target.checked)}
                    className="rounded bg-slate-900 border-white/10 text-cyan-500 focus:ring-cyan-500/40 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 cursor-pointer">
                  <div>
                    <div className="text-white font-medium">Course Schedule Changes</div>
                    <div className="text-[11px] text-slate-500">Room relocations and lecture timings</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={courseUpdates}
                    onChange={(e) => setCourseUpdates(e.target.checked)}
                    className="rounded bg-slate-900 border-white/10 text-cyan-500 focus:ring-cyan-500/40 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 cursor-pointer">
                  <div>
                    <div className="text-white font-medium">JSR Co-Pilot Summaries</div>
                    <div className="text-[11px] text-slate-500">Daily workload and assignment advisory briefs</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={jsrSummaries}
                    onChange={(e) => setJsrSummaries(e.target.checked)}
                    className="rounded bg-slate-900 border-white/10 text-cyan-500 focus:ring-cyan-500/40 cursor-pointer"
                  />
                </label>
              </div>
            </GlassCard>

          </div>
        )}

      </div>
    </ProtectedRoute>
  );
};
