import React from 'react';
import Sidebar from '@/shared/components/Sidebar';
import { MANAGER_MENU } from '@/shared/constants/sidebar-menus';

export default function ManagerLayout({ children }: { children: React.ReactNode }) {
  // Mock data User (Sau này sẽ lấy từ Context hoặc API Login)
  const managerInfo = {
    name: 'Alex Johnson',
    role: 'Manager',
    avatar: '/avatars/alex.png' // Nhớ copy ảnh vào public/avatars/
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar cố định bên trái */}
      <Sidebar menuItems={MANAGER_MENU} user={managerInfo} />

      {/* Nội dung chính bên phải */}
      <main className="flex-1 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}