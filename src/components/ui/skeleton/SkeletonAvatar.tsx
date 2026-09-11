import React from 'react';
import { Skeleton } from './Skeleton';

export interface SkeletonAvatarProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | number;
  className?: string;
}

export const SkeletonAvatar: React.FC<SkeletonAvatarProps> = ({
  size = 'md',
  className = '',
}) => {
  const getSizeClass = () => {
    if (typeof size === 'number') return '';
    switch (size) {
      case 'sm': return 'w-8 h-8';
      case 'lg': return 'w-14 h-14';
      case 'xl': return 'w-20 h-20';
      case 'md':
      default:
        return 'w-10 h-10';
    }
  };

  const customStyle = typeof size === 'number' ? { width: size, height: size } : undefined;

  return (
    <Skeleton
      variant="circular"
      className={`${getSizeClass()} shrink-0 ${className}`}
      style={customStyle}
    />
  );
};
