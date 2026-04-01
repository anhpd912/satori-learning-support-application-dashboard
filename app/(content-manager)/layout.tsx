import React from 'react';
import Sidebar from '@/shared/components/Sidebar';
import { CONTENT_MANAGER_MENU } from '@/shared/constants/sidebar-menus';
import AuthGuard from '@/shared/components/AuthGuard';
import ImportNotificationMonitor from '@/shared/components/ImportNotificationMonitor';

export default function ContentManagerLayout({ children }: { children: React.ReactNode }) {
    return (
        <AuthGuard allowedRoles={['CONTENT_MANAGER']}>
            <div className="flex min-h-screen bg-gray-50">
                <Sidebar menuItems={CONTENT_MANAGER_MENU} />
                <main className="flex-1 overflow-x-hidden">
                    {children}
                </main>
                <ImportNotificationMonitor />
            </div>
        </AuthGuard>
    );
}
