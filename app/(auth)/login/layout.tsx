import React from 'react';
import { Metadata } from 'next';

// 1. Khai báo Tiêu đề trang (Metadata)
export const metadata: Metadata = {
  title: 'Đăng nhập | Satori Management',
  description: 'Hệ thống quản lý học tập Satori',
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full min-h-screen bg-white">
      {children}
    </div>
  );
}