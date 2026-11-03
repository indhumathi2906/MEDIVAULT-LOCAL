import React from 'react';

export const Skeleton = ({ className = 'h-4 w-full', count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`bg-slate-200/80 dark:bg-slate-800 animate-pulse rounded-md ${className}`}
        />
      ))}
    </>
  );
};

export default Skeleton;
