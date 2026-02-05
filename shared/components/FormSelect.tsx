import React from 'react';

interface Option {
  label: string;
  value: string | number;
}

interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: Option[];
  placeholder?: string;
  error?: string;
}

export default function FormSelect({ 
  label, 
  options, 
  placeholder, 
  required, 
  error,
  className = '',
  value,
  ...props 
}: FormSelectProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div className="relative">
        <select 
          className={`w-full px-4 py-3 rounded-lg border appearance-none focus:outline-none focus:ring-2 transition-all cursor-pointer
            ${error 
              ? 'border-red-500 focus:ring-red-200 focus:border-red-500' // Style khi có lỗi (Viền đỏ)
              : 'border-gray-300 focus:ring-indigo-500 focus:border-transparent' // Style bình thường
            }
            ${!value ? 'text-gray-400' : 'text-gray-900'} // Nếu chưa chọn thì màu nhạt, chọn rồi thì màu đậm
            ${className}
          `}
          value={value} 
          {...props}
        >
          <option value="" disabled className="text-gray-400">
            {placeholder || 'Vui lòng chọn'}
          </option>
          
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="text-gray-900">
              {opt.label}
            </option>
          ))}
        </select>
        
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
          <svg width="12" height="8" viewBox="0 0 12 8" fill="none" stroke="currentColor" strokeWidth="2">
             <path d="M1 1.5L6 6.5L11 1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

      {error && (
        <p className="mt-1 text-xs text-red-500 font-medium animate-pulse">
            {error}
        </p>
      )}
    </div>
  );
}