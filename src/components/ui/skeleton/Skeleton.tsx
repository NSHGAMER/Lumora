import React from 'react';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  variant?: 'rectangular' | 'rounded' | 'circular';
  width?: string | number;
  height?: string | number;
  pulse?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rounded',
  width,
  height,
  pulse = true,
  style,
  ...props
}) => {
  const getVariantClass = () => {
    switch (variant) {
      case 'circular':
        return 'rounded-full';
      case 'rectangular':
        return 'rounded-none';
      case 'rounded':
      default:
        return 'rounded-xl';
    }
  };

  const inlineStyle: React.CSSProperties = {
    ...(width !== undefined ? { width } : {}),
    ...(height !== undefined ? { height } : {}),
    ...style,
  };

  return (
    <div
      role="status"
      aria-label="Loading..."
      className={`relative overflow-hidden bg-white/[0.04] border border-white/[0.06] ${
        pulse ? 'animate-pulse' : ''
      } ${getVariantClass()} ${className}`}
      style={inlineStyle}
      {...props}
    >
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/[0.05] to-transparent pointer-events-none" />
      <span className="sr-only">Loading...</span>
    </div>
  );
};
