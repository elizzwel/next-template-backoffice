'use client';

import type { SelectHTMLAttributes, ReactNode } from 'react';

type Option = { value: string | number; label: ReactNode };

type SelectProps = {
  label?: ReactNode;
  error?: string;
  options?: Option[];
  required?: boolean;
  className?: string;
} & SelectHTMLAttributes<HTMLSelectElement>;

export default function Select({ 
  label, 
  error, 
  options = [],
  required = false,
  className = '',
  ...props 
}: SelectProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          error ? 'border-red-500' : 'border-gray-300'
        } ${className}`}
        {...props}
      >
        <option value="">Pilih...</option>
        {options.map((option) => (
          <option key={String(option.value)} value={String(option.value)}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}




