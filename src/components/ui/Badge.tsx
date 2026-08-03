import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'cyan' | 'blue' | 'purple' | 'green' | 'amber' | 'slate';
  pulse?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'cyan',
  pulse = false,
  className = '',
}) => {
  const getStyles = () => {
    switch (variant) {
      case 'cyan':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
      case 'blue':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'purple':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'green':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'amber':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'slate':
      default:
        return 'bg-slate-800/80 text-slate-300 border-slate-700/50';
    }
  };

  const getDotColor = () => {
    switch (variant) {
      case 'cyan': return 'bg-cyan-400';
      case 'blue': return 'bg-blue-400';
      case 'purple': return 'bg-purple-400';
      case 'green': return 'bg-emerald-400';
      case 'amber': return 'bg-amber-400';
      default: return 'bg-slate-400';
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium border backdrop-blur-md ${getStyles()} ${className}`}
    >
      {pulse && (
        <span className="relative flex h-2 w-2">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${getDotColor()}`} />
          <span className={`relative inline-flex rounded-full h-2 w-2 ${getDotColor()}`} />
        </span>
      )}
      {children}
    </span>
  );
};
