'use client';

import React from 'react';
import Link from 'next/link';

interface PageHeaderProps {
  
  breadcrumb: React.ReactNode;
  
  // 2. Nút Quay lại
  backUrl: string;
  backLabel?: string;

  // 3. Nội dung bên phải (Chọn 1 trong 2)
  // Cách A: Truyền title & description (Dùng cho trang Tạo/Sửa)
  title?: string;
  description?: string;
  
  // Cách B: Truyền nút bấm (Dùng cho trang Chi tiết)
  action?: React.ReactNode;
}

export default function PageHeader({ 
  breadcrumb, 
  backUrl, 
  backLabel = 'Quay lại danh sách', 
  title, 
  description, 
  action 
}: PageHeaderProps) {
  return (
    <div className="mb-6">
      {/* Dòng 1: Breadcrumb */}
      <div className="text-xs text-gray-500 mb-2">
        {breadcrumb}
      </div>
      
      {/* Dòng 2: Navigation Area */}
      <div className="flex justify-between items-end">
          {/* Bên trái: Nút quay lại */}
          <Link 
              href={backUrl} 
              className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 text-sm font-medium transition-colors"
          >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              {backLabel}
          </Link>

          {/* Bên phải: Tiêu đề HOẶC Nút hành động */}
          <div className="text-right">
              {/* Nếu có action (nút bấm) thì hiển thị action */}
              {action ? (
                <div>{action}</div>
              ) : (
                /* Nếu không thì hiển thị Title & Description */
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