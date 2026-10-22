import React from 'react';

export const Card = ({ children, className = '', ...props }) => {
  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200/90 shadow-xs ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
