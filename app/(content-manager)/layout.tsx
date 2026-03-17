import React from 'react';
import Sidebar from '@/shared/components/Sidebar';
import { CONTENT_MANAGER_MENU } from '@/shared/constants/sidebar-menus';
import AuthGuard from '@/shared/components/AuthGuard';

export default function ContentManagerLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar menuItems={CONTENT_MANAGER_MENU} />
            <main className="flex-1 overflow-x-hidden">
                {children}
            </main>
        </div>
    );
}
