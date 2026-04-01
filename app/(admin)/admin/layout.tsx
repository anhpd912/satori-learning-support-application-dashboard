import React from 'react';
import Sidebar from '@/shared/components/Sidebar';
import { ADMIN_MENU } from '@/shared/constants/sidebar-menus';
import AuthGuard from '@/shared/components/AuthGuard';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard allowedRoles={['ADMIN']}>
      <div className="flex h-screen bg-gray-50">
        <Sidebar menuItems={ADMIN_MENU} />
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}