import React from 'react';
import { Skeleton } from './Skeleton';

export interface SkeletonCampusProps {
  className?: string;
}

export const SkeletonCampus: React.FC<SkeletonCampusProps> = ({
  className = '',
}) => {
  return (
    <div
      className={`p-5 rounded-2xl bg-[#0A1019]/70 backdrop-blur-xl border border-white/10 space-y-4 ${className}`}
    >
      {/* Building Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1 w-2/3">
          <Skeleton height="16px" width="70%" />
          <Skeleton height="11px" width="40%" />
        </div>
        <Skeleton height="22px" width="55px" className="rounded-full" />
      </div>

      {/* Occupancy bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <Skeleton height="10px" width="60px" />
          <Skeleton height="10px" width="35px" />
        </div>
        <Skeleton height="6px" width="100%" className="rounded-full" />
      </div>

      {/* Telemetry Metrics */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5">
        <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5 space-y-1">
          <Skeleton height="9px" width="50%" />
          <Skeleton height="14px" width="80%" />
        </div>
        <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5 space-y-1">
          <Skeleton height="9px" width="50%" />
          <Skeleton height="14px" width="80%" />
        </div>
      </div>
    </div>
  );
};
