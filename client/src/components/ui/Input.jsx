import React from 'react';

export const Input = ({
  label,
  error,
  helperText,
  id,
  className = '',
  required = false,
  ...props
}) => {
  const inputId = id || props.name || Math.random().toString(36).substring(2, 9);

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold text-[#1E3B2F] mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        id={inputId}
        required={required}
        className={`w-full px-3 py-2 border rounded-xl shadow-2xs placeholder-gray-400 text-xs sm:text-sm focus:outline-none focus:border-[#1E3B2F] focus:ring-1 focus:ring-[#1E3B2F] transition-colors ${
          error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-[#C8B48A]/50 bg-white'
        } ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      {helperText && !error && <p className="mt-1 text-xs text-gray-500">{helperText}</p>}
    </div>
  );
};
