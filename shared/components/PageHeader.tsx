'use client';

import React from 'react';
import Link from 'next/link';

interface BreadcrumbItem {
  label: string;
  href?: string;
  active?: boolean;
}

interface PageHeaderProps {
  breadcrumb?: React.ReactNode | BreadcrumbItem[];
  backUrl?: string;
  backLabel?: string;
  title?: string;
  titleAlign?: 'left' | 'right';
  description?: string;
  action?: React.ReactNode;
}

export default function PageHeader({
  breadcrumb,
  backUrl,
  backLabel = 'Quay lại',
  title,
  titleAlign = 'left',
  description,
  action
}: PageHeaderProps) {
  const renderBreadcrumbs = () => {
    if (!breadcrumb) return null;

    if (Array.isArray(breadcrumb)) {
      return (
        <nav className="flex items-center gap-1.5 text-xs text-gray-500 font-medium whitespace-nowrap overflow-x-auto no-scrollbar pb-1">
          {breadcrumb.map((item, index) => (
            <React.Fragment key={index}>
              {index > 0 && <span className="text-gray-300">›</span>}
              {item.href && !item.active ? (
                <Link href={item.href} className="hover:text-gray-700 transition-colors">
                  {item.label}
                </Link>
              ) : (
                <span className={item.active ? "text-gray-900 font-bold" : ""}>
                  {item.label}
                </span>
              )}
            </React.Fragment>
          ))}
        </nav>
      );
    }

    return <div className="text-xs text-gray-500 font-medium">{breadcrumb}</div>;
  };

  return (
    <div className="mb-6">
      <div className="mb-3">
        {renderBreadcrumbs()}
      </div>

      <div className="flex justify-between items-center gap-4">
        <div className={`flex-1 flex ${titleAlign === 'right' ? 'flex-col md:flex-row md:items-center justify-between' : 'flex-col'}`}>
          {backUrl && (
            <Link
              href={backUrl}
              className={`flex items-center gap-1.5 text-slate-500 hover:text-slate-900 text-sm font-bold transition-colors whitespace-nowrap shrink-0 ${titleAlign === 'right' ? '' : 'mb-2'}`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              {backLabel}
            </Link>
          )}

          <div className={`w-full ${titleAlign === 'right' ? 'text-right' : ''}`}>
            {title && (
              <>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{title}</h1>
                {description && <p className="text-gray-500 text-sm mt-1">{description}</p>}
              </>
            )}
          </div>
        </div>

        {action && (
          <div className="flex items-center shrink-0">
            {action}
          </div>
        )}
      </div>
    </div>
  );
}