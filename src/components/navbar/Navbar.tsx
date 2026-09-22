import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Command, LayoutDashboard, Calendar, MapPin, UserCheck, ChevronDown, Terminal } from 'lucide-react';
import type { ActiveTab, SystemRole } from '../../types';

interface NavbarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  role: SystemRole;
  onChangeRole: (role: SystemRole) => void;
  onOpenCommandPalette: () => void;
  onOpenJSR: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  role,
  onChangeRole,
  onOpenCommandPalette,
  onOpenJSR,
}) => {
  const [showRoleDropdown, setShowRoleDropdown] = React.useState(false);

  const navItems = [
    { id: 'home' as ActiveTab, label: 'OS Showcase', icon: Terminal },
    { id: 'command' as ActiveTab, label: 'Command Center', icon: LayoutDashboard },
    { id: 'academics' as ActiveTab, label: 'Academics', icon: Calendar },
    { id: 'campus' as ActiveTab, label: '3D Campus Grid', icon: MapPin },
  ];

  return (
    <header className="fixed top-4 inset-x-0 z-40 max-w-7xl mx-auto px-4 sm:px-6 pointer-events-none">
      <div className="glass-panel rounded-2xl px-4 py-3 flex items-center justify-between pointer-events-auto shadow-luxury border border-white/10">
        
        {/* Brand Logo */}
        <button
          type="button"
          onClick={() => onSelectTab('home')}
          className="flex items-center gap-3 cursor-pointer text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60 rounded-xl"
          aria-label="Lumora Home - OS Showcase"
        >
          <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 shadow-accent-cyan">
            <Sparkles className="w-5 h-5 text-white animate-pulse" aria-hidden="true" />
          </div>
          <div>
            <div className="font-heading font-bold text-lg tracking-wider text-white flex items-center gap-1.5">
              LUMORA
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                v3.4 OS
              </span>
            </div>
            <div className="text-[10px] font-mono text-slate-400 -mt-1 hidden sm:block">
              Intelligent Campus OS
            </div>
          </div>
        </button>

        {/* Navigation Tabs */}
        <nav aria-label="Main Navigation" className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1.5 rounded-xl border border-white/5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`relative px-3.5 py-1.5 rounded-lg text-xs font-heading font-medium transition-all duration-200 flex items-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60 ${
                  isActive ? 'text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNavIndicator"
                    className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-600/30 to-cyan-500/30 border border-cyan-400/40"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
                <Icon className={`w-3.5 h-3.5 relative z-10 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} aria-hidden="true" />
                <span className="relative z-10">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Action Bar */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Spotlight Cmd+K Button */}
          <button
            type="button"
            onClick={onOpenCommandPalette}
            aria-label="Search and Spotlight Command Palette (Command-K)"
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-white/10 hover:border-cyan-500/40 text-slate-400 hover:text-slate-200 transition-all text-xs font-mono cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60"
          >
            <Command className="w-3.5 h-3.5 text-cyan-400" aria-hidden="true" />
            <span>Search</span>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-400 border border-slate-700">⌘K</kbd>
          </button>

          {/* Role Switcher */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowRoleDropdown(!showRoleDropdown)}
              aria-label="Switch system role"
              aria-haspopup="true"
              aria-expanded={showRoleDropdown}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-white/10 hover:border-white/20 text-xs font-mono text-slate-200 transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60"
            >
              <UserCheck className="w-3.5 h-3.5 text-cyan-400" aria-hidden="true" />
              <span className="capitalize">{role}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" aria-hidden="true" />
            </button>

            {showRoleDropdown && (
              <div className="absolute right-0 mt-2 w-36 bg-[#0A1019] border border-white/10 rounded-xl shadow-2xl py-1 z-50">
                {(['student', 'faculty', 'admin'] as SystemRole[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => {
                      onChangeRole(r);
                      setShowRoleDropdown(false);
                    }}
                    className={`w-full px-3 py-1.5 text-left text-xs font-mono capitalize transition-colors flex items-center justify-between cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400 ${
                      role === r ? 'text-cyan-400 bg-cyan-500/10' : 'text-slate-300 hover:bg-white/5'
                    }`}
                  >
                    <span>{r} Mode</span>
                    {role === r && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />}
                  </button>
                ))}

                <div className="pt-1 mt-1 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => {
                      onSelectTab('account');
                      setShowRoleDropdown(false);
                    }}
                    className="w-full px-3 py-1.5 text-left text-xs font-mono text-cyan-300 hover:bg-white/5 transition-colors cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400"
                  >
                    Account Settings
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onSelectTab('login');
                      setShowRoleDropdown(false);
                    }}
                    className="w-full px-3 py-1.5 text-left text-xs font-mono text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400"
                  >
                    Sign In / Register
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* JSR Assistant Launch Button */}
          <button
            type="button"
            onClick={onOpenJSR}
            aria-label="Launch JSR AI Assistant"
            className="relative group flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-heading font-medium text-xs shadow-accent-cyan hover:shadow-cyan-500/50 transition-all cursor-pointer overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60"
          >
            <span className="absolute inset-0 w-full h-full bg-white/20 group-hover:scale-110 transition-transform duration-300 pointer-events-none" />
            <Sparkles className="w-3.5 h-3.5 text-white animate-spin-slow" aria-hidden="true" />
            <span className="font-mono">JSR AI</span>
          </button>
        </div>
      </div>
    </header>
  );
};
