import React from 'react';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string | null;
  icon?: React.ReactNode; 
}

export default function FormInput({ label, error, value, className = '', required, icon, ...props }: FormInputProps) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div className="relative">
        <input 
          className={`w-full px-4 py-3 rounded-lg border transition-all placeholder-gray-400 text-gray-900 outline-none
            ${icon ? 'pr-10' : ''}
            ${error 
              ? 'border-red-500 focus:ring-2 focus:ring-red-200' 
              : 'border-gray-200 focus:border-[#253A8C] focus:ring-2 focus:ring-[#253A8C]/20' /* Dùng màu brand chuẩn */
            }
          `}
          {...props}
          value={value !== undefined && value !== null ? value : ''}
        />

        {icon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            {icon}
          </div>
        )}
      </div>

      {error && (
        <p className="mt-1 text-xs text-red-500 font-medium animate-pulse">
            {error}
        </p>
      )}
    </div>
  );
}