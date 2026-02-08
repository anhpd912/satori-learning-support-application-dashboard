'use client';

import React, { useEffect, useState } from 'react';
import Sidebar from '@/shared/components/Sidebar';
import { ADMIN_MENU, MANAGER_MENU, MenuItem } from '@/shared/constants/sidebar-menus';

export default function AuthDashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [menuItems, setMenuItems] = useState<MenuItem[]>(MANAGER_MENU);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true); 

        if (typeof window !== 'undefined') {
            const storedUser = localStorage.getItem('currentUser');
            if (storedUser) {
                try {
                    const user = JSON.parse(storedUser);
                    if (user.role === 'ADMIN' || user.role === 'Admin') {
                        setMenuItems(ADMIN_MENU);
                    } else {
                        setMenuItems(MANAGER_MENU);
                    }
                } catch (error) {
                    console.error("Lỗi đọc role:", error);
                }
            }
        }

        console.log("Mounted AuthDashboardLayout with menuItems:", menuItems);
    }, []); 

    if (!isMounted) return null; 

    return (
        <div className="flex min-h-screen bg-gray-50">
              <Sidebar menuItems={menuItems}/>
        
              <main className="p-6 md:p-10 flex-1 overflow-x-hidden">
                {children}
              </main>
            </div>
    );
}