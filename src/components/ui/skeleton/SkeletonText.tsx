import React from 'react';
import { Skeleton } from './Skeleton';

export interface SkeletonTextProps {
  lines?: number;
  gap?: string;
  lastLineWidth?: string;
  className?: string;
  lineHeight?: string | number;
}

export const SkeletonText: React.FC<SkeletonTextProps> = ({
  lines = 3,
  gap = 'gap-2.5',
  lastLineWidth = '60%',
  className = '',
  lineHeight = '14px',
}) => {
  return (
    <div className={`flex flex-col ${gap} ${className}`}>
      {Array.from({ length: lines }).map((_, index) => {
        const isLast = index === lines - 1;
        return (
          <Skeleton
            key={index}
            height={lineHeight}
            width={isLast && lines > 1 ? lastLineWidth : '100%'}
            className="rounded-md"
          />
        );
      })}
    </div>
  );
};
