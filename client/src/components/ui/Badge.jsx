import React from 'react';

export const Badge = ({
  children,
  variant = 'info',
  size = 'md',
  className = '',
}) => {
  const variants = {
    info: 'bg-blue-50 text-blue-800 border-blue-200/90',
    indigo: 'bg-indigo-50 text-indigo-800 border-indigo-200/90',
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200/90',
    warning: 'bg-amber-50 text-amber-900 border-amber-300/80',
    danger: 'bg-rose-50 text-rose-800 border-rose-200/90',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200/80',
    purple: 'bg-purple-50 text-purple-800 border-purple-200/90',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[11px] font-semibold tracking-tight',
    md: 'px-2.5 py-1 text-xs font-semibold',
    lg: 'px-3 py-1.5 text-sm font-semibold',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border shadow-2xs select-none ${
        variants[variant] || variants.info
      } ${sizes[size] || sizes.md} ${className}`}
    >
      {children}
    </span>
  );
};
