import React from 'react';
import { Skeleton } from './Skeleton';
import { SkeletonCard } from './SkeletonCard';
import { SkeletonList } from './SkeletonList';

export interface SkeletonDashboardProps {
  className?: string;
}

export const SkeletonDashboard: React.FC<SkeletonDashboardProps> = ({
  className = '',
}) => {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Top Telemetry Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="p-5 rounded-2xl bg-[#0A1019]/70 backdrop-blur-xl border border-white/10 space-y-3"
          >
            <div className="flex items-center justify-between">
              <Skeleton height="12px" width="45%" />
              <Skeleton variant="rounded" width={28} height={28} className="rounded-lg" />
            </div>
            <Skeleton height="28px" width="70%" />
            <div className="flex items-center gap-2">
              <Skeleton height="10px" width="30%" />
              <Skeleton height="10px" width="20%" />
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid: Chart Area + Side List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 rounded-2xl bg-[#0A1019]/70 backdrop-blur-xl border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1.5 w-1/3">
              <Skeleton height="18px" width="80%" />
              <Skeleton height="12px" width="50%" />
            </div>
            <div className="flex gap-2">
              <Skeleton height="28px" width="60px" className="rounded-lg" />
              <Skeleton height="28px" width="60px" className="rounded-lg" />
            </div>
          </div>
          <Skeleton height="220px" width="100%" className="rounded-xl" />
        </div>

        <div className="p-6 rounded-2xl bg-[#0A1019]/70 backdrop-blur-xl border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton height="18px" width="50%" />
            <Skeleton height="12px" width="25%" />
          </div>
          <SkeletonList items={3} />
        </div>
      </div>

      {/* Action Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SkeletonCard lines={2} />
        <SkeletonCard lines={2} />
      </div>
    </div>
  );
};
