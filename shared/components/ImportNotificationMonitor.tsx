'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Toast from './Toast';
import { curriculumImportService, ImportStatus, CurriculumImportSummaryResponse } from '@/shared/services/curriculumImport.service';

export default function ImportNotificationMonitor() {
    const router = useRouter();
    const [toast, setToast] = useState<{ isVisible: boolean; message: React.ReactNode; type: 'success' | 'info' }>({
        isVisible: false,
        message: '',
        type: 'info'
    });

    // Lưu danh sách ID đã biết để chỉ notify khi có cái mới CHUYỂN sang PENDING_APPROVAL
    const knownPendingIds = useRef<Set<string>>(new Set());
    const isFirstRun = useRef(true);

    const checkImports = async () => {
        try {
            // Lấy danh sách các bản ghi đang chờ duyệt
            const response = await curriculumImportService.listImports({
                status: ImportStatus.PENDING_APPROVAL,
                page: 0,
                size: 5
            });

            const currentPending = response.content;
            const newPending = currentPending.filter(item => !knownPendingIds.current.has(item.id));

            if (newPending.length > 0) {
                // Nếu không phải lần chạy đầu tiên (vừa load trang), thì mới hiện Toast
                if (!isFirstRun.current) {
                    const latest = newPending[0];
                    showNotification(latest);
                }

                // Cập nhật danh sách đã biết
                newPending.forEach(item => knownPendingIds.current.add(item.id));
            }
            
            isFirstRun.current = false;
        } catch (error) {
            console.error('Failed to check import status:', error);
        }
    };

    const showNotification = (item: CurriculumImportSummaryResponse) => {
        setToast({
            isVisible: true,
            type: 'success',
            message: (
                <div className="flex flex-col gap-1">
                    <p className="font-bold">Nhập dữ liệu hoàn tất!</p>
                    <p className="text-xs opacity-90">Tệp "{item.fileName}" đã được xử lý xong.</p>
                    <button 
                        onClick={() => {
                            setToast(prev => ({ ...prev, isVisible: false }));
                            router.push(`/courses/${item.courseId}/lessons?importId=${item.id}`);
                        }}
                        className="mt-2 text-xs font-bold underline text-left hover:text-white transition-colors"
                    >
                        Click để Review ngay →
                    </button>
                </div>
            )
        });
    };

    useEffect(() => {
        // Kiểm tra ngay khi mount
        checkImports();

        // Polling mỗi 30 giây
        const interval = setInterval(checkImports, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <Toast 
            isVisible={toast.isVisible}
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
        />
    );
}
