import React from 'react';
import Sidebar from '@/shared/components/Sidebar';
import { OPERATION_MANAGER_MENU } from '@/shared/constants/sidebar-menus';
import AuthGuard from '@/shared/components/AuthGuard';

export default function OperationManagerLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard allowedRoles={['OPERATION_MANAGER']}>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar menuItems={OPERATION_MANAGER_MENU} />
        <main className="flex-1 overflow-x-hidden">
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}