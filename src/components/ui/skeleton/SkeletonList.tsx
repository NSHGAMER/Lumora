import React from 'react';
import { Skeleton } from './Skeleton';
import { SkeletonAvatar } from './SkeletonAvatar';

export interface SkeletonListProps {
  items?: number;
  className?: string;
}

export const SkeletonList: React.FC<SkeletonListProps> = ({
  items = 4,
  className = '',
}) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: items }).map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] border border-white/5"
        >
          <div className="flex items-center gap-3 w-3/4">
            <SkeletonAvatar size="sm" />
            <div className="space-y-1.5 w-full">
              <Skeleton height="14px" width="60%" className="rounded" />
              <Skeleton height="11px" width="40%" className="rounded" />
            </div>
          </div>
          <Skeleton height="24px" width="50px" className="rounded-lg" />
        </div>
      ))}
    </div>
  );
};
