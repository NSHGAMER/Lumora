import React from 'react';
import { Skeleton } from './Skeleton';
import { SkeletonText } from './SkeletonText';

export interface SkeletonCardProps {
  className?: string;
  hasHeader?: boolean;
  hasFooter?: boolean;
  lines?: number;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({
  className = '',
  hasHeader = true,
  hasFooter = true,
  lines = 3,
}) => {
  return (
    <div
      className={`rounded-2xl bg-[#0A1019]/70 backdrop-blur-xl border border-white/10 p-6 space-y-4 ${className}`}
    >
      {hasHeader && (
        <div className="flex items-center justify-between pb-3 border-b border-white/5">
          <div className="flex items-center gap-3 w-3/4">
            <Skeleton variant="rounded" width={36} height={36} className="rounded-xl shrink-0" />
            <div className="space-y-1.5 w-full">
              <Skeleton height="16px" width="55%" />
              <Skeleton height="12px" width="35%" />
            </div>
          </div>
          <Skeleton variant="rounded" width={60} height={22} className="rounded-full" />
        </div>
      )}

      <SkeletonText lines={lines} lineHeight="14px" gap="gap-3" />

      {hasFooter && (
        <div className="pt-3 border-t border-white/5 flex items-center justify-between">
          <Skeleton height="12px" width="40%" />
          <Skeleton height="28px" width="80px" className="rounded-lg" />
        </div>
      )}
    </div>
  );
};
