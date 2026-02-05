'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/shared/components/Sidebar';
import { ADMIN_MENU } from '@/shared/constants/sidebar-menus';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    const accessToken = localStorage.getItem('accessToken');

    if (!storedUser || !accessToken) {
      router.push('/login');
      return;
    }

    try {
      const user = JSON.parse(storedUser);

      if (user.role !== 'ADMIN') {
        router.push('/forbidden');
        return;
      }

      setTimeout(() => {
        setIsAuthorized(true);
      }, 0);
      
    } catch (error) {
      localStorage.clear();
      router.push('/login');
    }
  }, [router]);

  if (!isAuthorized) {
    return (
        <div className="h-screen w-full flex items-center justify-center bg-gray-50">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#253A8C]"></div>
        </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar menuItems={ADMIN_MENU} />
      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>
    </div>
  );
}