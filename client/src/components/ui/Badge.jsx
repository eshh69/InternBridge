import React from 'react';

export const Badge = ({
  children,
  variant = 'info',
  size = 'md',
  className = '',
}) => {
  const variants = {
    forest: 'bg-[#1E3B2F]/10 text-[#1E3B2F] border-[#1E3B2F]/20',
    sage: 'bg-[#7F8C6A]/15 text-[#1E3B2F] border-[#7F8C6A]/35',
    sand: 'bg-[#C8B48A]/25 text-[#1E3B2F] border-[#C8B48A]/50',
    cream: 'bg-[#F5F0E6] text-[#1E3B2F] border-[#C8B48A]/40',
    info: 'bg-[#7F8C6A]/15 text-[#1E3B2F] border-[#7F8C6A]/30',
    indigo: 'bg-[#1E3B2F]/10 text-[#1E3B2F] border-[#1E3B2F]/20',
    success: 'bg-[#7F8C6A]/20 text-[#1E3B2F] border-[#7F8C6A]/40',
    warning: 'bg-[#C8B48A]/30 text-[#1E3B2F] border-[#C8B48A]/60',
    danger: 'bg-rose-50 text-rose-800 border-rose-200/90',
    neutral: 'bg-[#F5F0E6] text-[#1E3B2F] border-[#C8B48A]/40',
    purple: 'bg-[#1E3B2F]/15 text-[#1E3B2F] border-[#1E3B2F]/30',
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
