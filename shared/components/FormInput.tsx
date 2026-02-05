import React from 'react';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export default function FormInput({ label, error, value, className = '', required, ...props }: FormInputProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <input 
        className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:border-transparent transition-all placeholder-gray-400 text-gray-900 ${
            error 
            ? 'border-red-500 focus:ring-red-200' 
            : 'border-gray-300 focus:ring-indigo-500'
        } ${className}`}
        
        {...props}
        value={value !== undefined && value !== null ? value : ''}
      />
      {error && (
        <p className="mt-1 text-xs text-red-500 font-medium animate-pulse">
            {error}
        </p>
      )}
    </div>
  );
}