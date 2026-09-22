import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Command, Sparkles, LayoutDashboard, Calendar, MapPin, Cpu, ArrowRight, X, Shield, Scale, Cookie, User, LogIn, UserPlus } from 'lucide-react';
import type { ActiveTab } from '../../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenJSR: (initialQuery?: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectTab,
  onOpenJSR,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery('');
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const commandItems = [
    {
      id: 'cmd-1',
      title: 'Open Campus Command Center',
      category: 'Navigation',
      icon: LayoutDashboard,
      shortcut: 'Cmd 1',
      action: () => {
        onSelectTab('command');
        onClose();
      },
    },
    {
      id: 'cmd-2',
      title: 'Launch JSR AI Co-Pilot',
      category: 'AI Assistant',
      icon: Sparkles,
      shortcut: 'Cmd J',
      action: () => {
        onOpenJSR();
        onClose();
      },
    },
    {
      id: 'cmd-3',
      title: 'View Smart Academics & Schedule Matrix',
      category: 'Academics',
      icon: Calendar,
      shortcut: 'Cmd 2',
      action: () => {
        onSelectTab('academics');
        onClose();
      },
    },
    {
      id: 'cmd-4',
      title: 'Campus 3D Spatial Grid & Lab Occupancy',
      category: 'Spatial Grid',
      icon: MapPin,
      shortcut: 'Cmd 3',
      action: () => {
        onSelectTab('campus');
        onClose();
      },
    },
    {
      id: 'cmd-5',
      title: 'Ask JSR: "Optimize my schedule for next semester"',
      category: 'JSR AI Action',
      icon: Cpu,
      action: () => {
        onOpenJSR('Optimize my schedule for next semester');
        onClose();
      },
    },
    {
      id: 'cmd-6',
      title: 'Ask JSR: "Check quantum lab GPU station availability"',
      category: 'JSR AI Action',
      icon: Cpu,
      action: () => {
        onOpenJSR('Check quantum lab GPU station availability');
        onClose();
      },
    },
    {
      id: 'cmd-7',
      title: 'Review Institutional Privacy Protocol',
      category: 'Legal & Governance',
      icon: Shield,
      action: () => {
        onSelectTab('privacy');
        onClose();
      },
    },
    {
      id: 'cmd-8',
      title: 'View Platform Terms of Service',
      category: 'Legal & Governance',
      icon: Scale,
      action: () => {
        onSelectTab('terms');
        onClose();
      },
    },
    {
      id: 'cmd-9',
      title: 'Configure Cookie & Telemetry Preferences',
      category: 'Preferences',
      icon: Cookie,
      action: () => {
        onSelectTab('cookie-preferences');
        onClose();
      },
    },
    {
      id: 'cmd-10',
      title: 'Account Settings & Security Profile',
      category: 'Account',
      icon: User,
      action: () => {
        onSelectTab('account');
        onClose();
      },
    },
    {
      id: 'cmd-11',
      title: 'Sign In to Campus OS Console',
      category: 'Account',
      icon: LogIn,
      action: () => {
        onSelectTab('login');
        onClose();
      },
    },
    {
      id: 'cmd-12',
      title: 'Register New Campus Account Profile',
      category: 'Account',
      icon: UserPlus,
      action: () => {
        onSelectTab('register');
        onClose();
      },
    },
  ];

  const filteredItems = commandItems.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 sm:px-6">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#05070B]/80 backdrop-blur-md"
          />

          {/* Dialog Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            role="dialog"
            aria-modal="true"
            aria-label="Spotlight Command Palette"
            className="relative w-full max-w-2xl bg-[#0A1019] border border-cyan-500/30 rounded-2xl shadow-2xl shadow-cyan-950/40 overflow-hidden z-10"
          >
            {/* Input Bar */}
            <div className="flex items-center px-4 border-b border-white/10 py-3.5 bg-white/5">
              <Search className="w-5 h-5 text-cyan-400 mr-3" aria-hidden="true" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type a command, ask JSR AI, or search campus modules..."
                aria-label="Type a command, ask JSR AI, or search campus modules"
                autoFocus
                className="w-full bg-transparent text-slate-100 placeholder-slate-500 focus:outline-none font-sans text-base"
              />
              <button
                type="button"
                onClick={onClose}
                aria-label="Close Command Palette"
                className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            {/* Command List */}
            <div className="max-h-[380px] overflow-y-auto p-2 space-y-1">
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={item.action}
                      className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/10 text-left transition-colors group cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 group-hover:bg-cyan-500/20 group-hover:text-cyan-300">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-slate-200 group-hover:text-white">
                            {item.title}
                          </div>
                          <div className="text-xs text-slate-500 font-mono">{item.category}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {item.shortcut && (
                          <span className="px-2 py-0.5 text-xs font-mono rounded bg-slate-800 text-slate-400 border border-slate-700">
                            {item.shortcut}
                          </span>
                        )}
                        <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="p-8 text-center text-slate-400">
                  <Sparkles className="w-8 h-8 text-cyan-400 mx-auto mb-2 opacity-60 animate-pulse" />
                  <p className="text-sm">No standard command matches &quot;{query}&quot;</p>
                  <button
                    onClick={() => {
                      onOpenJSR(query);
                      onClose();
                    }}
                    className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-mono hover:bg-cyan-500/30 transition-all cursor-pointer"
                  >
                    Ask JSR AI &quot;{query}&quot;
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2.5 border-t border-white/10 bg-slate-950/60 flex items-center justify-between text-xs text-slate-500 font-mono">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">↑↓</kbd> navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">↵</kbd> select
                </span>
              </div>
              <div className="flex items-center gap-1 text-cyan-400">
                <Command className="w-3.5 h-3.5" />
                <span>Lumora OS Spotlight</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
