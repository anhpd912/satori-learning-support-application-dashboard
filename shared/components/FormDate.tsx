import React from 'react';

interface FormDateProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export default function FormDate({ label, className = '', ...props }: FormDateProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="relative">
        <input 
          type="date"
          className={`w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder-gray-400 text-gray-700
            ${className}
          `}
          // CSS này giúp ẩn icon lịch mặc định xấu xí của Chrome/Edge để ta dùng icon custom
          // nhưng vẫn giữ được tính năng click vào là hiện lịch
          style={{ colorScheme: 'light' }} 
          {...props} 
        />
        
        {/* Icon Lịch Custom (Giống Figma) */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
        </div>
      </div>
    </div>
  );
}