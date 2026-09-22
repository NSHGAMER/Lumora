import React from 'react';
import { Cookie, ArrowLeft, ShieldCheck, Check, RotateCcw, Sliders, Info } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { Badge } from '../ui/Badge';
import { useCookiePreferences } from '../../hooks/useCookiePreferences';
import type { ActiveTab } from '../../types';

interface CookiePreferencesViewProps {
  onSelectTab: (tab: ActiveTab) => void;
}

export const CookiePreferencesView: React.FC<CookiePreferencesViewProps> = ({ onSelectTab }) => {
  const {
    preferences,
    updatePreference,
    savePreferences,
    resetPreferences,
    isSaved,
  } = useCookiePreferences();

  return (
    <div className="pt-28 pb-20 px-4 sm:px-6 max-w-4xl mx-auto space-y-10">
      
      {/* Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <button
          onClick={() => onSelectTab('home')}
          className="inline-flex items-center gap-2 text-xs font-mono text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Campus Hub</span>
        </button>
        <div className="flex items-center gap-3">
          <Badge variant="cyan">
            <Cookie className="w-3 h-3" />
            <span>Local Storage & Cookies</span>
          </Badge>
          {preferences.updatedAt && (
            <span className="text-xs font-mono text-slate-500 hidden sm:inline">
              Saved: {new Date(preferences.updatedAt).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>

      {/* Hero Title */}
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono">
          <Sliders className="w-3.5 h-3.5" />
          <span>Telemetry & Preference Controls</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-white tracking-tight">
          Cookie & State Preferences
        </h1>
        <p className="text-slate-400 font-sans text-sm sm:text-base max-w-3xl leading-relaxed">
          Configure how Lumora manages local device state, theme tokens, and telemetry. We respect your autonomy: non-essential tracking is strictly optional and disabled by default.
        </p>

        {/* Success Feedback Alert */}
        {isSaved && (
          <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-between text-xs font-mono text-emerald-300 animate-fadeIn">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Preferences saved successfully to local storage.</span>
            </div>
            <span className="text-[10px] text-emerald-400/80 uppercase tracking-wider">Active</span>
          </div>
        )}
      </div>

      {/* Category Cards */}
      <div className="space-y-6 font-sans">
        
        {/* Category 1: Essential */}
        <GlassCard interactive={false} glowColor="cyan" className="space-y-4 border-cyan-500/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-cyan-400" />
                <h2 className="text-lg font-heading font-semibold text-white">
                  1. Essential System State
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Always Required
                </span>
              </div>
              <p className="text-slate-400 text-xs sm:text-sm">
                Strictly necessary for security, role identification, session continuity, and core navigation.
              </p>
            </div>
            
            {/* Locked Toggle Switch */}
            <div className="flex items-center gap-2 sm:self-center">
              <span className="text-xs font-mono text-cyan-400 font-medium">Locked On</span>
              <div className="w-12 h-6 rounded-full bg-cyan-600/40 p-1 flex items-center justify-end cursor-not-allowed border border-cyan-400/40">
                <div className="w-4 h-4 rounded-full bg-cyan-300 shadow-md" />
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-xs font-mono text-slate-400 space-y-1">
            <div className="text-slate-300 font-medium">Stored Parameters:</div>
            <div className="flex flex-wrap gap-2 text-[11px] pt-1">
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">active_role</span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">session_token</span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">csrf_token</span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">security_clearance</span>
            </div>
            <div className="pt-2 text-[11px] text-slate-500 flex items-center gap-1.5">
              <Info className="w-3 h-3 text-slate-400 shrink-0" />
              <span>These items cannot be disabled as the campus operating system cannot function securely without them.</span>
            </div>
          </div>
        </GlassCard>

        {/* Category 2: Preferences */}
        <GlassCard interactive={false} glowColor="blue" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <Sliders className="w-5 h-5 text-blue-400" />
                <h2 className="text-lg font-heading font-semibold text-white">
                  2. User Interface Preferences
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Customizable
                </span>
              </div>
              <p className="text-slate-400 text-xs sm:text-sm">
                Remembers your chosen theme (Dark / Light / System), sidebar states, and dashboard layout density.
              </p>
            </div>
            
            {/* Interactive Toggle Switch */}
            <div className="flex items-center gap-2 sm:self-center">
              <span className="text-xs font-mono text-slate-400">
                {preferences.preferences ? 'Enabled' : 'Disabled'}
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={preferences.preferences}
                onClick={() => updatePreference('preferences', !preferences.preferences)}
                className={`w-12 h-6 rounded-full transition-colors duration-200 p-1 flex items-center cursor-pointer border ${
                  preferences.preferences
                    ? 'bg-blue-600 border-blue-400 justify-end'
                    : 'bg-slate-800 border-slate-700 justify-start'
                }`}
              >
                <div className={`w-4 h-4 rounded-full transition-transform duration-200 ${
                  preferences.preferences ? 'bg-white' : 'bg-slate-400'
                }`} />
              </button>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-xs font-mono text-slate-400">
            <div className="text-slate-300 font-medium">Stored Parameters:</div>
            <div className="flex flex-wrap gap-2 text-[11px] pt-1">
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">theme_mode</span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">command_palette_history</span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">view_filters</span>
            </div>
          </div>
        </GlassCard>

        {/* Category 3: Analytics */}
        <GlassCard interactive={false} glowColor="purple" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <Cookie className="w-5 h-5 text-purple-400" />
                <h2 className="text-lg font-heading font-semibold text-white">
                  3. Telemetry & Analytics
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Opt-In Only
                </span>
              </div>
              <p className="text-slate-400 text-xs sm:text-sm">
                Aggregates non-personally identifiable diagnostic telemetry to evaluate campus grid rendering and load performance.
              </p>
            </div>
            
            {/* Interactive Toggle Switch */}
            <div className="flex items-center gap-2 sm:self-center">
              <span className="text-xs font-mono text-slate-400">
                {preferences.analytics ? 'Enabled' : 'Disabled (Default)'}
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={preferences.analytics}
                onClick={() => updatePreference('analytics', !preferences.analytics)}
                className={`w-12 h-6 rounded-full transition-colors duration-200 p-1 flex items-center cursor-pointer border ${
                  preferences.analytics
                    ? 'bg-purple-600 border-purple-400 justify-end'
                    : 'bg-slate-800 border-slate-700 justify-start'
                }`}
              >
                <div className={`w-4 h-4 rounded-full transition-transform duration-200 ${
                  preferences.analytics ? 'bg-white' : 'bg-slate-400'
                }`} />
              </button>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-xs font-mono text-slate-400 space-y-1">
            <div className="text-slate-300 font-medium">Compliance Guarantee:</div>
            <p className="text-xs text-slate-400">
              Disabled by default. Lumora never injects third-party marketing beacons or ad network trackers.
            </p>
          </div>
        </GlassCard>

      </div>

      {/* Action Buttons Bar */}
      <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <button
          type="button"
          onClick={resetPreferences}
          className="flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset to Recommended Defaults</span>
        </button>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => onSelectTab('home')}
            className="w-1/2 sm:w-auto px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 hover:border-white/20 text-xs font-mono text-slate-300 transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={savePreferences}
            className="w-1/2 sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-xs font-heading font-semibold shadow-accent-cyan transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Save Preferences</span>
          </button>
        </div>
      </div>

    </div>
  );
};
