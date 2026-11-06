import React from 'react';

export const Card = ({ children, className = '', ...props }) => {
  return (
    <div
      className={`rounded-2xl border border-[#C8B48A]/35 shadow-xs hover:shadow-md transition-all duration-200 p-6 bg-white ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
