'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface AuthGuardProps {
    children: React.ReactNode;
    allowedRoles: string[]; // Mảng chứa các role được phép vào
}

export default function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem('currentUser');
        const accessToken = localStorage.getItem('accessToken');

        // 1. Không có vé -> Đuổi về Login
        if (!storedUser || !accessToken) {
            router.replace('/login');
            return;
        }

        try {
            const user = JSON.parse(storedUser);

            // 2. Có vé nhưng sai chức vụ (Role không nằm trong danh sách cho phép) -> Báo lỗi 403
            if (!allowedRoles.includes(user.role)) {
                router.replace('/forbidden');
                return;
            }

            // 3. Vé chuẩn, chức vụ chuẩn -> Mở cổng
            setTimeout(() => setIsAuthorized(true), 0);

        } catch (error) {
            localStorage.clear();
            router.replace('/login');
        }
    }, [router, allowedRoles]);

    // Hiện vòng xoay trong lúc kiểm tra
    if (!isAuthorized) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#253A8C]"></div>
            </div>
        );
    }

    return <>{children}</>;
}