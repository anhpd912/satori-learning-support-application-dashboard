'use client';

import React from 'react';
import Link from 'next/link';

interface PageHeaderProps {
  
  breadcrumb: React.ReactNode;
  
  backUrl?: string;
  backLabel?: string;

  title?: string;
  description?: string;
  
  action?: React.ReactNode;
}

export default function PageHeader({ 
  breadcrumb, 
  backUrl, 
  backLabel = 'Quay lại', 
  title, 
  description, 
  action 
}: PageHeaderProps) {
  return (
    <div className="mb-6">
      <div className="text-xs text-gray-500 mb-2">
        {breadcrumb}
      </div>
      
      <div className="flex justify-between items-end">
          {backUrl && (
            <Link 
                href={backUrl} 
                className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 text-sm font-medium transition-colors"
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
                {backLabel}
            </Link>
          )}

          <div className={backUrl ? "text-right" : ""}>
              {action ? (
                <div>{action}</div>
              ) : (
                <>
                  <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
                  {description && <p className="text-gray-500 text-sm mt-1">{description}</p>}
                </>
              )}
          </div>
      </div>
    </div>
  );
}