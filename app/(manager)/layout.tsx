import React from 'react';
import Sidebar from '@/shared/components/Sidebar';
import { MANAGER_MENU } from '@/shared/constants/sidebar-menus';

export default function ManagerLayout({ children }: { children: React.ReactNode }) {

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar menuItems={MANAGER_MENU}/>

      <main className="flex-1 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}