import React from 'react';

export const Card = ({ children, className = '', ...props }) => {
  return (
    <div
      className={`bg-white rounded-[10px] border border-gray-200/80 shadow-sm p-6 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
