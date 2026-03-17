'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface AuthGuardProps {
    children: React.ReactNode;
    allowedRoles: string[];
}

export default function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        const raw = localStorage.getItem('currentUser');

        if (!raw) {
            // Chưa đăng nhập → về trang login
            router.replace('/login');
            return;
        }

        try {
            const user = JSON.parse(raw) as { role: string };
            if (allowedRoles.includes(user.role)) {
                setIsAuthorized(true);
            } else {
                // Đã đăng nhập nhưng không đủ quyền
                router.replace('/forbidden');
            }
        } catch {
            // User data bị corrupt
            localStorage.removeItem('currentUser');
            router.replace('/login');
        }
    }, [router, allowedRoles]);

    if (!isAuthorized) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#253A8C]"></div>
            </div>
        );
    }

    return <>{children}</>;
}