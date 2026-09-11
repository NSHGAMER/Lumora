import React from 'react';
import { Skeleton } from './Skeleton';
import { SkeletonAvatar } from './SkeletonAvatar';
import { SkeletonText } from './SkeletonText';

export interface SkeletonProfileProps {
  className?: string;
}

export const SkeletonProfile: React.FC<SkeletonProfileProps> = ({
  className = '',
}) => {
  return (
    <div
      className={`p-6 rounded-2xl bg-[#0A1019]/70 backdrop-blur-xl border border-white/10 space-y-6 ${className}`}
    >
      {/* Profile Header */}
      <div className="flex items-center gap-4">
        <SkeletonAvatar size="lg" />
        <div className="space-y-2 w-full">
          <div className="flex items-center gap-2">
            <Skeleton height="18px" width="40%" />
            <Skeleton height="20px" width="60px" className="rounded-full" />
          </div>
          <Skeleton height="12px" width="30%" />
        </div>
      </div>

      {/* Metadata fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-white/5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5">
            <Skeleton height="10px" width="35%" />
            <Skeleton height="14px" width="65%" />
          </div>
        ))}
      </div>

      {/* Bio / Description */}
      <div className="space-y-2">
        <Skeleton height="12px" width="25%" />
        <SkeletonText lines={2} lineHeight="12px" />
      </div>
    </div>
  );
};
