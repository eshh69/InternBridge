import React from 'react';

export const Spinner = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className={`flex items-center justify-center p-4 ${className}`}>
      <div
        className={`${sizes[size] || sizes.md} animate-spin rounded-full border-4 border-[#C8B48A]/40 border-t-[#1E3B2F]`}
      />
    </div>
  );
};
