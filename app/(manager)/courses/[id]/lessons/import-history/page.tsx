'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

import CommonTable, { Column } from '@/shared/components/CommonTable';
import Pagination from '@/shared/components/Pagination';
import PageHeader from '@/shared/components/PageHeader';
import Toast, { ToastType } from '@/shared/components/Toast';
import { curriculumImportService, CurriculumImportSummaryResponse, ImportStatus } from '@/shared/services/curriculumImport.service';

const ITEMS_PER_PAGE = 10;

export default function ImportHistoryPage() {
    const router = useRouter();
    const params = useParams();
    const courseId = params?.id as string;

    const [historyData, setHistoryData] = useState<CurriculumImportSummaryResponse[]>([]);
    const [totalItems, setTotalItems] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    
    const [toast, setToast] = useState<{ message: string; type: ToastType; isVisible: boolean }>({
        message: '', type: 'success', isVisible: false
    });

    const fetchHistory = async () => {
        setIsLoading(true);
        try {
            const response = await curriculumImportService.listImports({
                courseId,
                page: currentPage - 1,
                size: ITEMS_PER_PAGE
            });
            setHistoryData(response.content);
            setTotalItems(response.totalElements);
        } catch (error: any) {
            setToast({ message: error.message || 'Lỗi tải lịch sử nhập', type: 'error', isVisible: true });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, [courseId, currentPage]);

    // Kỹ thuật Polling: Nếu có bất kỳ item nào đang PROCESSING, refetch định kỳ
    useEffect(() => {
        const hasProcessing = historyData.some(item => 
            item.status === ImportStatus.QUEUED || item.status === ImportStatus.PROCESSING
        );

        if (hasProcessing) {
            const interval = setInterval(() => {
                fetchHistory();
            }, 5000); // 5 giây check một lần
            return () => clearInterval(interval);
        }
    }, [historyData]);

    const getStatusBadge = (status: ImportStatus) => {
        switch (status) {
            case ImportStatus.QUEUED:
            case ImportStatus.PROCESSING:
                return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">Đang xử lý <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span></span>;
            case ImportStatus.PENDING_APPROVAL:
                return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700">Chờ duyệt <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span></span>;
            case ImportStatus.COMPLETED:
                return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">Thành công <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span></span>;
            case ImportStatus.FAILED:
                return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">Lỗi <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span></span>;
            case ImportStatus.CANCELLED:
            case ImportStatus.ROLLED_BACK:
                return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gray-200 text-gray-700">{status === ImportStatus.ROLLED_BACK ? 'Đã Rollback' : 'Đã hủy'} <span className="w-1.5 h-1.5 rounded-full bg-gray-500"></span></span>;
            default:
                return null;
        }
    };

    const handleAction = async (id: string, action: 'cancel' | 'rollback' | 'retry') => {
        try {
            if (action === 'cancel') await curriculumImportService.cancelImport(id);
            if (action === 'rollback') await curriculumImportService.rollbackImport(id);
            if (action === 'retry') await curriculumImportService.retryImport(id);
            
            setToast({ message: 'Thao tác thành công', type: 'success', isVisible: true });
            fetchHistory();
        } catch (error: any) {
            setToast({ message: error.message, type: 'error', isVisible: true });
        }
    };

    const columns = useMemo<Column<CurriculumImportSummaryResponse>[]>(() => [
        {
            header: 'Mã Import',
            render: (item) => <span className="text-gray-500 font-medium text-sm">#{item.id.substring(0, 8)}</span>
        },
        {
            header: 'Tên File',
            render: (item) => <span className="font-bold text-gray-900 text-sm">{item.fileName}</span>
        },
        {
            header: 'Thời gian',
            render: (item) => <span className="text-gray-500 text-sm">{new Date(item.createdAt).toLocaleString('vi-VN')}</span>
        },
        {
            header: 'Kết quả',
            render: (item) => (
                <div className="flex flex-col gap-1">
                    <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-600 text-xs font-semibold rounded">{item.lessonCount} Bài học</span>
                </div>
            )
        },
        {
            header: 'Trạng thái',
            render: (item) => getStatusBadge(item.status)
        },
        {
            header: 'Thao tác',
            className: 'text-right',
            render: (item) => (
                <div className="flex items-center justify-end gap-3 text-gray-400">
                    {item.status === ImportStatus.PENDING_APPROVAL && (
                        <button 
                            onClick={() => router.push(`/courses/${courseId}/lessons?importId=${item.id}`)}
                            className="bg-blue-600 text-white px-3 py-1 rounded-md text-xs font-bold hover:bg-blue-700 transition-colors"
                        >
                            Review
                        </button>
                    )}
                    {item.status === ImportStatus.FAILED && (
                        <button onClick={() => handleAction(item.id, 'retry')} className="hover:text-blue-600 transition-colors" title="Thử lại">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 4v6h6M23 20v-6h-6M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" /></svg>
                        </button>
                    )}
                    {item.status === ImportStatus.COMPLETED && (
                        <button onClick={() => handleAction(item.id, 'rollback')} className="hover:text-red-500 transition-colors" title="Rollback">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 2v6h6M21 12A9 9 0 0 0 6 5.3L3 8" /></svg>
                        </button>
                    )}
                </div>
            )
        }
    ], [courseId, router]);

    return (
        <div className="p-8 bg-gray-50 min-h-screen font-sans w-full pb-20">
            <Toast message={toast.message} type={toast.type} isVisible={toast.isVisible} onClose={() => setToast(prev => ({ ...prev, isVisible: false }))} />

            <PageHeader 
                breadcrumb={(
                    <div className="flex items-center gap-2">
                        <Link href="/courses" className="hover:text-indigo-600 transition-colors">Quản lí khóa học</Link>
                        <span className="text-gray-400">/</span>
                        <Link href={`/courses/${courseId}`} className="hover:text-indigo-600 transition-colors">Chi tiết khóa học</Link>
                        <span className="text-gray-400">/</span>
                        <Link href={`/courses/${courseId}/lessons`} className="hover:text-indigo-600 transition-colors">Quản lý bài học</Link>
                        <span className="text-gray-400">/</span>
                        <span className="text-gray-900 font-medium">Lịch sử nhập giáo trình</span>
                    </div>
                )}
                backUrl={`/courses/${courseId}/lessons`} 
                title="Lịch sử nhập giáo trình"
                description="Theo dõi và quản lý các lượt nạp dữ liệu từ AI"
            />

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8">
                <CommonTable 
                    data={historyData} 
                    columns={columns} 
                    keyExtractor={(item) => item.id} 
                    isLoading={isLoading} 
                />
                
                {!isLoading && totalItems > 0 && (
                    <Pagination 
                        currentPage={currentPage} 
                        totalPages={Math.ceil(totalItems / ITEMS_PER_PAGE)} 
                        onPageChange={setCurrentPage} 
                        totalItems={totalItems} 
                        itemsPerPage={ITEMS_PER_PAGE} 
                    />
                )}
            </div>
        </div>
    );
}
