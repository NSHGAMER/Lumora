import React from 'react';
import { Skeleton } from './Skeleton';

export interface SkeletonTableProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export const SkeletonTable: React.FC<SkeletonTableProps> = ({
  rows = 5,
  columns = 4,
  className = '',
}) => {
  return (
    <div className={`rounded-2xl bg-[#0A1019]/70 backdrop-blur-xl border border-white/10 overflow-hidden ${className}`}>
      {/* Table Header */}
      <div className="grid grid-cols-4 gap-4 p-4 border-b border-white/10 bg-white/[0.02]">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} height="14px" width={i === 0 ? '70%' : '50%'} className="rounded" />
        ))}
      </div>

      {/* Table Rows */}
      <div className="divide-y divide-white/5">
        {Array.from({ length: rows }).map((_, rIndex) => (
          <div key={rIndex} className="grid grid-cols-4 gap-4 p-4 items-center">
            {Array.from({ length: columns }).map((_, cIndex) => (
              <Skeleton
                key={cIndex}
                height="12px"
                width={cIndex === 0 ? '80%' : cIndex === columns - 1 ? '40%' : '65%'}
                className="rounded"
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
