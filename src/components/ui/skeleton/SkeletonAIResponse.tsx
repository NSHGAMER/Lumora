import React from 'react';
import { Skeleton } from './Skeleton';
import { SkeletonText } from './SkeletonText';

export interface SkeletonAIResponseProps {
  className?: string;
  hasCodeBlock?: boolean;
}

export const SkeletonAIResponse: React.FC<SkeletonAIResponseProps> = ({
  className = '',
  hasCodeBlock = true,
}) => {
  return (
    <div
      className={`p-5 rounded-2xl bg-gradient-to-br from-cyan-950/20 via-[#0A1019] to-[#0A1019] border border-cyan-500/20 space-y-4 ${className}`}
    >
      {/* JSR Agent Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-500/30">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton height="14px" width="90px" />
            <span className="text-[10px] font-mono text-cyan-400/70 animate-pulse">
              Synthesizing...
            </span>
          </div>
        </div>
        <Skeleton height="18px" width="65px" className="rounded-full" />
      </div>

      {/* Response Paragraphs */}
      <SkeletonText lines={3} lineHeight="14px" gap="gap-2.5" lastLineWidth="75%" />

      {/* Optional Code/Data block skeleton */}
      {hasCodeBlock && (
        <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2 font-mono">
          <div className="flex items-center justify-between pb-2 border-b border-white/5">
            <Skeleton height="10px" width="80px" />
            <Skeleton height="10px" width="40px" />
          </div>
          <Skeleton height="12px" width="85%" />
          <Skeleton height="12px" width="95%" />
          <Skeleton height="12px" width="60%" />
        </div>
      )}

      {/* Quick Action Pills */}
      <div className="flex items-center gap-2 pt-2">
        <Skeleton height="26px" width="100px" className="rounded-lg" />
        <Skeleton height="26px" width="120px" className="rounded-lg" />
      </div>
    </div>
  );
};
