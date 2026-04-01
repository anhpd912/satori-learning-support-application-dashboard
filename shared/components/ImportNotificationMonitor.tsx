'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Toast from './Toast';
import { curriculumImportService, ImportStatus, CurriculumImportSummaryResponse } from '@/features/curriculum-import/services/curriculumImport.service';

export default function ImportNotificationMonitor() {
    const router = useRouter();
    const [toast, setToast] = useState<{ isVisible: boolean; message: React.ReactNode; type: 'success' | 'error' | 'info' }>({
        isVisible: false,
        message: '',
        type: 'info'
    });

    // Track IDs đã seen để chỉ notify khi có item mới chuyển trạng thái
    const knownIds = useRef<Set<string>>(new Set());
    const isFirstRun = useRef(true);

    const checkImports = async () => {
        try {
            // Parallel fetch cả PENDING_APPROVAL và FAILED
            const [pendingRes, failedRes] = await Promise.all([
                curriculumImportService.listImports({ status: ImportStatus.PENDING_APPROVAL, page: 0, size: 5 }),
                curriculumImportService.listImports({ status: ImportStatus.FAILED, page: 0, size: 5 }),
            ]);

            const allNew = [
                ...pendingRes.content,
                ...failedRes.content,
            ].filter(item => !knownIds.current.has(item.id));

            if (allNew.length > 0) {
                // Chỉ hiện toast khi không phải lần chạy đầu (tránh spam khi vừa vào trang)
                if (!isFirstRun.current) {
                    // Ưu tiên show FAILED trước nếu có
                    const failed = allNew.find(i => i.status === ImportStatus.FAILED);
                    if (failed) {
                        showFailedNotification(failed);
                    } else {
                        showSuccessNotification(allNew[0]);
                    }
                }

                // Cập nhật danh sách đã biết
                allNew.forEach(item => knownIds.current.add(item.id));
            }

            isFirstRun.current = false;
        } catch (error) {
            // Nếu lỗi mạng thì im lặng, không spam console trong môi trường production
            console.warn('[ImportMonitor] Failed to check import status:', error);
        }
    };

    const showSuccessNotification = (item: CurriculumImportSummaryResponse) => {
        setToast({
            isVisible: true,
            type: 'success',
            message: (
                <div className="flex flex-col gap-1">
                    <p className="font-bold">Nhập giáo trình hoàn tất!</p>
                    <p className="text-xs opacity-90">Tệp &quot;{item.originalFilename}&quot; đã được xử lý xong và đang chờ duyệt.</p>
                    {item.courseId && (
                        <button
                            onClick={() => {
                                setToast(prev => ({ ...prev, isVisible: false }));
                                router.push(`/courses/${item.courseId}/lessons?importId=${item.id}`);
                            }}
                            className="mt-2 text-xs font-bold underline text-left hover:opacity-80 transition-opacity"
                        >
                            Xem & Review ngay →
                        </button>
                    )}
                </div>
            )
        });
    };

    const showFailedNotification = (item: CurriculumImportSummaryResponse) => {
        setToast({
            isVisible: true,
            type: 'error',
            message: (
                <div className="flex flex-col gap-1">
                    <p className="font-bold">Import giáo trình thất bại!</p>
                    <p className="text-xs opacity-90">Tệp &quot;{item.originalFilename}&quot; xử lý bị lỗi. Vui lòng thử lại.</p>
                    <button
                        onClick={() => {
                            setToast(prev => ({ ...prev, isVisible: false }));
                            router.push('/import-history');
                        }}
                        className="mt-2 text-xs font-bold underline text-left hover:opacity-80 transition-opacity"
                    >
                        Xem lịch sử import →
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
