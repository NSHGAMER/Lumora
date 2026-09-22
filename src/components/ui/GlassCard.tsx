import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  glowColor?: 'blue' | 'cyan' | 'purple' | 'green' | 'none';
  interactive?: boolean;
  onClick?: () => void;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  contentClassName = '',
  glowColor = 'cyan',
  interactive = true,
  onClick,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || !interactive) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const getGlowGradient = () => {
    switch (glowColor) {
      case 'blue':
        return 'rgba(59, 130, 246, 0.15)';
      case 'cyan':
        return 'rgba(6, 182, 212, 0.15)';
      case 'purple':
        return 'rgba(139, 92, 246, 0.15)';
      case 'green':
        return 'rgba(34, 197, 94, 0.15)';
      default:
        return 'rgba(255, 255, 255, 0.08)';
    }
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      whileHover={interactive ? { y: -3, transition: { duration: 0.2 } } : {}}
      className={`relative rounded-2xl bg-[#0A1019]/70 backdrop-blur-xl border border-white/10 p-6 overflow-hidden transition-all duration-300 ${
        interactive ? 'cursor-pointer hover:border-white/20 hover:shadow-2xl' : ''
      } ${className}`}
    >
      {/* Light sheen ambient layer following mouse */}
      {interactive && isHovered && (
        <div
          className="pointer-events-none absolute -inset-px transition-opacity duration-300 opacity-100 rounded-2xl"
          style={{
            background: `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, ${getGlowGradient()}, transparent 70%)`,
          }}
        />
      )}

      {/* Content wrapper */}
      <div className={`relative z-10 h-full flex flex-col ${contentClassName}`}>{children}</div>
    </motion.div>
  );
};
