import React from 'react';

interface InfoItemProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
}

export default function InfoItem({ label, value, icon }: InfoItemProps) {
  return (
    <div>
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <div className="flex items-center gap-2">
        {/* Render Icon */}
        <div className="text-indigo-600">
            {icon}
        </div>
        <span className="text-gray-900 font-medium">{value}</span>
      </div>
    </div>
  );
}