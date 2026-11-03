import React from 'react';

export const EcgWave = ({ className = 'h-8 w-full text-teal-600', animated = true }) => {
  return (
    <div className={`overflow-hidden flex items-center ${className}`}>
      <svg
        viewBox="0 0 500 60"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
        preserveAspectRatio="none"
      >
        <path
          d="M0 30 L120 30 L135 20 L145 42 L160 5 L175 55 L190 25 L200 35 L210 30 L320 30 L335 18 L345 44 L360 4 L375 56 L390 24 L400 36 L410 30 L500 30"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={animated ? 'animate-ecg' : ''}
        />
      </svg>
    </div>
  );
};

export default EcgWave;
