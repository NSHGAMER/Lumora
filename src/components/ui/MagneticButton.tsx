import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

interface MagneticButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'glass' | 'glow';
  showArrow?: boolean;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

export const MagneticButton: React.FC<MagneticButtonProps> = ({
  children,
  variant = 'primary',
  showArrow = true,
  className = '',
  onClick,
  disabled = false,
  type = 'button',
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!buttonRef.current || disabled) return;
    const { left, top, width, height } = buttonRef.current.getBoundingClientRect();
    const x = (e.clientX - (left + width / 2)) * 0.3;
    const y = (e.clientY - (top + height / 2)) * 0.3;
    setPosition({ x, y });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return 'bg-gradient-to-r from-blue-600 via-cyan-500 to-purple-600 text-white shadow-accent-blue border border-cyan-400/30 hover:shadow-cyan-500/50';
      case 'glow':
        return 'bg-[#0A1019]/90 text-white border border-cyan-400/50 hover:border-cyan-300 hover:bg-[#0F172A] shadow-glass-glow';
      case 'glass':
        return 'bg-white/5 backdrop-blur-xl text-slate-200 border border-white/10 hover:border-white/30 hover:bg-white/10';
      case 'secondary':
      default:
        return 'bg-slate-900 text-slate-100 border border-slate-700/60 hover:border-slate-500 hover:bg-slate-800';
    }
  };

  return (
    <motion.button
      ref={buttonRef}
      type={type}
      disabled={disabled}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: 'spring', stiffness: 250, damping: 15, mass: 0.2 }}
      onClick={onClick}
      className={`relative group inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-heading font-medium text-sm transition-all duration-300 overflow-hidden cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#05070B] ${getVariantStyles()} ${className}`}
    >
      {/* Background glow sheen effect on hover */}
      <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-white/0 via-white/15 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out pointer-events-none" />

      <span className="relative z-10 flex items-center gap-2">
        {children}
        {showArrow && (
          <ArrowUpRight aria-hidden="true" className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        )}
      </span>
    </motion.button>
  );
};
