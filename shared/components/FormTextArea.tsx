'use client';

import React from 'react';

interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label: string;
    error?: string;
}

export default function FormTextarea({ 
    label, 
    error, 
    required, 
    className = '', 
    ...props 
}: FormTextareaProps) {
    return (
        <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-2">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <textarea
                className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-all resize-y text-sm text-gray-900 placeholder-gray-400 ${
                    error 
                        ? 'border-red-500 focus:ring-red-200 focus:border-red-500' 
                        : 'border-gray-200 focus:ring-[#253A8C] focus:border-transparent'
                } ${className}`}
                {...props}
            />
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
    );
}