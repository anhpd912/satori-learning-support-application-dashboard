'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import CommonTable, { Column } from '@/shared/components/CommonTable';
import Pagination from '@/shared/components/Pagination';
import PageHeader from '@/shared/components/PageHeader';
import Toast, { ToastType } from '@/shared/components/Toast';
import ConfirmModal from '@/shared/components/ConfirmModal';
import { curriculumImportService, ImportStatus, CurriculumImportSummaryResponse, ImportStatisticsResponse } from '@/features/curriculum-import/services/curriculumImport.service';
import ImportDetailModal from './ImportDetailModal';

const ITEMS_PER_PAGE = 5;

interface ImportHistoryClientProps {
    courseId: string;
}

export default function ImportHistoryClient({ courseId }: ImportHistoryClientProps) {
    const router = useRouter();

    const [history, setHistory] = useState<CurriculumImportSummaryResponse[]>([]);
    const [stats, setStats] = useState<ImportStatisticsResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [statusFilter, setStatusFilter] = useState<ImportStatus | 'ALL'>('ALL');
    const [selectedImport, setSelectedImport] = useState<CurriculumImportSummaryResponse | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [onlyThisCourse, setOnlyThisCourse] = useState(true);

    const [toast, setToast] = useState<{ message: string; type: ToastType; isVisible: boolean }>({
        message: '', type: 'success', isVisible: false
    });

    // Confirm modal state
    type ConfirmAction = 'approve' | 'rollback' | 'retry' | 'cancel' | null;
    const [confirmModal, setConfirmModal] = useState<{ action: ConfirmAction; id: string; isLoading: boolean }>({
        action: null, id: '', isLoading: false
    });
    const closeConfirm = () => setConfirmModal({ action: null, id: '', isLoading: false });

    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

    const fetchData = async (silent = false) => {
        if (!silent) setIsLoading(true);
        console.log('Fetching import history for course:', courseId, 'with status:', statusFilter);
        try {
            const [historyData, statsData] = await Promise.all([
                curriculumImportService.listImports({
                    courseId: onlyThisCourse ? courseId : undefined,
                    status: statusFilter === 'ALL' ? undefined : statusFilter,
                    page: currentPage - 1,
                    size: ITEMS_PER_PAGE
                }),
                curriculumImportService.getStatistics(onlyThisCourse ? courseId : undefined)
            ]);
            console.log('Received history data:', historyData);
            
            if (historyData) {
                const newHistory = historyData.content || [];
                
                if (silent && history.length > 0) {
                    newHistory.forEach((newItem) => {
                        const oldItem = history.find(i => i.id === newItem.id);
                        if (oldItem && (oldItem.status === ImportStatus.PROCESSING || oldItem.status === ImportStatus.QUEUED)) {
                            if (newItem.status === ImportStatus.PENDING_APPROVAL) {
                                setToast({ message: `Giáo trình "${newItem.originalFilename}" đã xử lý xong và đang chờ duyệt!`, type: 'success', isVisible: true });
                            } else if (newItem.status === ImportStatus.COMPLETED) {
                                setToast({ message: `Giáo trình "${newItem.originalFilename}" đã xử lý hoàn tất!`, type: 'success', isVisible: true });
                            } else if (newItem.status === ImportStatus.FAILED) {
                                setToast({ message: `Xử lý giáo trình "${newItem.originalFilename}" thất bại!`, type: 'error', isVisible: true });
                            }
                        }
                    });
                }
                
                setHistory(newHistory);
                setTotalItems(historyData.totalElements || 0);
            } else {
                setHistory([]);
                setTotalItems(0);
            }
            setStats(statsData);
        } catch (error: any) {
            console.error('Fetch History Error:', error);
            if (!silent) setToast({ message: error.message || 'Lỗi tải lịch sử nhập', type: 'error', isVisible: true });
        } finally {
            if (!silent) setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [courseId, currentPage, statusFilter, onlyThisCourse]);

    useEffect(() => {
        const hasProcessing = history.some(item => 
            item.status === ImportStatus.PROCESSING || item.status === ImportStatus.QUEUED
        );
        
        if (hasProcessing) {
            const interval = setInterval(() => {
                fetchData(true);
            }, 5000);
            return () => clearInterval(interval);
        }
    }, [history]);

    const handleRetry = async (id: string) => {
        setConfirmModal({ action: 'retry', id, isLoading: false });
    };

    const handleCancel = async (id: string) => {
        setConfirmModal({ action: 'cancel', id, isLoading: false });
    };

    const handleRollback = async (id: string) => {
        setConfirmModal({ action: 'rollback', id, isLoading: false });
    };

    const handleApprove = async (id: string) => {
        setConfirmModal({ action: 'approve', id, isLoading: false });
    };

    const handleReject = async (id: string) => {
        setConfirmModal({ action: 'rollback', id, isLoading: false });
    };

    const executeConfirmedAction = async () => {
        const { action, id } = confirmModal;
        if (!action || !id) return;
        setConfirmModal(prev => ({ ...prev, isLoading: true }));
        try {
            if (action === 'approve') {
                await curriculumImportService.approveImport(id);
                setToast({ message: 'Duyệt import thành công. Vui lòng kiểm tra các bài học ở phần danh sách bài học.', type: 'success', isVisible: true });
            } else if (action === 'rollback') {
                await curriculumImportService.rollbackImport(id);
                setToast({ message: 'Đang tiến hành hoàn tác dữ liệu...', type: 'success', isVisible: true });
            } else if (action === 'retry') {
                await curriculumImportService.retryImport(id);
                setToast({ message: 'Đang thử lại quá trình import...', type: 'success', isVisible: true });
            } else if (action === 'cancel') {
                await curriculumImportService.cancelImport(id);
                setToast({ message: 'Đã gửi yêu cầu hủy bỏ.', type: 'success', isVisible: true });
            }
            closeConfirm();
            fetchData(true);
        } catch (error: any) {
            setToast({ message: error.message, type: 'error', isVisible: true });
            closeConfirm();
        }
    };

    const getStatusBadge = (status: ImportStatus) => {
        switch (status) {
            case ImportStatus.QUEUED:
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-600 border border-blue-100">
                        Đang chờ <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
                    </span>
                );
            case ImportStatus.PROCESSING:
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-600 border border-blue-100">
                        Đang xử lý <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                    </span>
                );
            case ImportStatus.PENDING_APPROVAL:
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-600 border border-indigo-100">
                        Chờ duyệt <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce"></span>
                    </span>
                );
            case ImportStatus.COMPLETED:
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-green-50 text-green-600 border border-green-100">
                        Thành công <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                    </span>
                );
            case ImportStatus.FAILED:
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-red-50 text-red-600 border border-red-100">
                        Lỗi <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                    </span>
                );
            case ImportStatus.CANCELLED:
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-gray-100 text-gray-500 border border-gray-200">
                        Đã hủy <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                    </span>
                );
            case ImportStatus.ROLLED_BACK:
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-gray-100 text-gray-500 border border-gray-200">
                        Đã Rollback <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                    </span>
                );
            default:
                return <span className="text-gray-400">{status}</span>;
        }
    };

    const columns = useMemo<Column<CurriculumImportSummaryResponse>[]>(() => [
        {
            header: 'Mã Import',
            className: 'text-gray-400 font-medium text-xs',
            render: (item) => (
                <span className="text-gray-500 font-mono">
                    #IMP-{new Date(item.createdAt).toISOString().slice(0, 10).replace(/-/g, '')}-{item.id.substring(0, 2).toUpperCase()}
                </span>
            )
        },
        {
            header: 'Tên File / Bài học',
            className: 'max-w-[240px]',
            render: (item) => (
                <div className="flex flex-col">
                    <span 
                        className={`font-bold text-sm truncate ${item.status === ImportStatus.ROLLED_BACK ? 'text-gray-300' : 'text-gray-700'}`}
                        title={item.originalFilename}
                    >
                        {item.originalFilename}
                    </span>
                </div>
            )
        },
        {
            header: 'Thời gian',
            render: (item) => (
                <div className="flex flex-col text-gray-500 text-xs font-medium">
                    <span>
                        {new Date(item.createdAt).toLocaleDateString('vi-VN', { 
                            day: '2-digit', month: '2-digit', year: 'numeric'
                        })}
                    </span>
                    <span>
                        {new Date(item.createdAt).toLocaleTimeString('vi-VN', { 
                            hour: '2-digit', minute: '2-digit'
                        })}
                    </span>
                </div>
            )
        },
        {
            header: 'Kết quả bóc tách',
            render: (item) => {
                if (item.status === ImportStatus.PROCESSING || item.status === ImportStatus.QUEUED) {
                    return (
                        <span className="text-gray-300 italic text-xs">Đang bóc tách...</span>
                    );
                }
                if (item.lessonsCreated > 0 || item.vocabularyCreated > 0 || item.grammarPointsCreated > 0) {
                    return (
                        <div className="flex flex-col gap-1.5">
                            {item.lessonsCreated > 0 && (
                                <span className="inline-flex items-center px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold rounded border border-blue-100 w-fit">
                                    {item.lessonsCreated} Bài học
                                </span>
                            )}
                            {item.vocabularyCreated > 0 && (
                                <span className="inline-flex items-center px-2 py-0.5 bg-green-50 text-green-600 text-[10px] font-bold rounded border border-green-100 w-fit">
                                    {item.vocabularyCreated} Từ vựng
                                </span>
                            )}
                            {item.grammarPointsCreated > 0 && (
                                <span className="inline-flex items-center px-2 py-0.5 bg-purple-50 text-purple-600 text-[10px] font-bold rounded border border-purple-100 w-fit">
                                    {item.grammarPointsCreated} Ngữ pháp
                                </span>
                            )}
                        </div>
                    );
                }
                return <span className="text-gray-300">—</span>;
            }
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
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            setSelectedImport(item);
                            setIsDetailOpen(true);
                        }}
                        disabled={item.status === ImportStatus.PROCESSING || item.status === ImportStatus.QUEUED}
                        className="hover:text-blue-500 transition-colors p-1.5 disabled:opacity-30" 
                        title="Xem chi tiết"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                    </button>

                    {item.status === ImportStatus.PENDING_APPROVAL && (
                        <>
                            <button 
                                onClick={(e) => { e.stopPropagation(); handleApprove(item.id); }} 
                                className="hover:text-green-500 transition-colors p-1.5" 
                                title="Phê duyệt"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            </button>
                            <button 
                                onClick={(e) => { e.stopPropagation(); handleRollback(item.id); }} 
                                className="hover:text-orange-500 transition-colors p-1.5" 
                                title="Hoàn tác"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v6h6"></path><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"></path></svg>
                            </button>
                        </>
                    )}

                    {item.status === ImportStatus.FAILED && (
                        <button
                            onClick={(e) => { e.stopPropagation(); handleRetry(item.id); }}
                            className="hover:text-blue-500 transition-colors p-1.5"
                            title="Thử lại"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
                        </button>
                    )}

                    {item.status === ImportStatus.COMPLETED && (
                        <button
                            onClick={(e) => { e.stopPropagation(); handleRollback(item.id); }}
                            className="hover:text-orange-500 transition-colors p-1.5"
                            title="Hoàn tác"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v6h6"></path><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"></path></svg>
                        </button>
                    )}
                </div>
            )
        }
    ], [courseId, handleCancel, handleRetry, handleRollback, handleApprove, handleReject, router]);

    return (
        <div className="p-8 bg-white min-h-screen font-sans w-full pb-20">
            <Toast message={toast.message} type={toast.type} isVisible={toast.isVisible} onClose={() => setToast(prev => ({ ...prev, isVisible: false }))} />

            <ImportDetailModal 
                importData={selectedImport} 
                isOpen={isDetailOpen} 
                onClose={() => setIsDetailOpen(false)} 
            />

            <ConfirmModal
                isOpen={!!confirmModal.action}
                onClose={closeConfirm}
                onConfirm={executeConfirmedAction}
                title={
                    confirmModal.action === 'approve' ? 'Xác nhận phê duyệt' :
                    confirmModal.action === 'rollback' ? 'Xác nhận hoàn tác' :
                    confirmModal.action === 'retry' ? 'Xác nhận thử lại' :
                    'Xác nhận hủy bỏ'
                }
                message={
                    confirmModal.action === 'approve' ? 'Bạn có chắc chắn muốn phê duyệt kết quả bóc tách này không? Các bài học, từ vựng và ngữ pháp sẽ được tạo và cập nhật.' :
                    confirmModal.action === 'rollback' ? 'Bạn có chắc chắn muốn hoàn tác dữ liệu này không? Các nội dung được tạo từ giáo trình này có thể bị xóa.' :
                    confirmModal.action === 'retry' ? 'Bạn có chắc chắn muốn thử lại quá trình xử lý giáo trình này không?' :
                    'Bạn có chắc chắn muốn hủy bỏ quá trình nhập dữ liệu này không?'
                }
                confirmText={
                    confirmModal.action === 'approve' ? 'Phê duyệt' :
                    confirmModal.action === 'rollback' ? 'Hoàn tác' :
                    confirmModal.action === 'retry' ? 'Thử lại' :
                    'Hủy bỏ'
                }
                variant={confirmModal.action === 'approve' || confirmModal.action === 'retry' ? 'info' : 'danger'}
                isLoading={confirmModal.isLoading}
            />

            <PageHeader
                breadcrumb={[
                    { label: 'Quản lí khóa học', href: '/courses' },
                    { label: 'N1', href: `/courses/${courseId}` },
                    { label: 'Quản lý nội dung bài học', href: `/courses/${courseId}/lessons` },
                    { label: 'Lịch sử nhập giáo trình', active: true }
                ]}
                backUrl={`/courses/${courseId}/lessons`}
                title="Lịch sử nhập giáo trình"
                titleAlign="right"
                description="Theo dõi và quản lý kết quả xử lý dữ liệu học liệu tự động"
                action={
                    <button 
                        onClick={() => fetchData()} 
                        disabled={isLoading}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-sm font-bold border border-blue-100 hover:bg-blue-100 transition-all disabled:opacity-50"
                    >
                        <svg className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M23 4v6h-6"></path><path d="M1 20v-6h6"></path><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
                        Làm mới
                    </button>
                }
            />

            <div className="flex flex-wrap items-center gap-4 mb-6">
                <div className="flex-1 min-w-[300px] relative">
                    <div className="absolute inset-y-0 left-0 pl-10 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tên file..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-16 pr-4 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-1 focus:ring-gray-200 text-sm text-gray-900 placeholder-gray-400 font-medium"
                    />
                </div>
                
                <div className="flex flex-wrap items-center gap-6">

                    <div className="relative">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as any)}
                            className="appearance-none pl-6 pr-12 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:outline-none text-sm font-bold text-gray-600 cursor-pointer hover:bg-gray-100 transition-colors"
                        >
                            <option value="ALL">Tất cả trạng thái</option>
                            <option value={ImportStatus.QUEUED}>Đang chờ</option>
                            <option value={ImportStatus.PROCESSING}>Đang xử lý</option>
                            <option value={ImportStatus.PENDING_APPROVAL}>Chờ duyệt</option>
                            <option value={ImportStatus.COMPLETED}>Thành công</option>
                            <option value={ImportStatus.FAILED}>Lỗi</option>
                            <option value={ImportStatus.CANCELLED}>Đã hủy</option>
                            <option value={ImportStatus.ROLLED_BACK}>Đã Rollback</option>
                        </select>
                        <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-400">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-gray-50 shadow-sm overflow-hidden mb-10">
                <CommonTable
                    data={history.filter(item => (item.originalFilename || '').toLowerCase().includes((searchTerm || '').toLowerCase()))}
                    columns={columns}
                    keyExtractor={(item) => item.id}
                    isLoading={isLoading}
                    className="history-table"
                    onRowClick={(item) => {
                        if (item.status === ImportStatus.PROCESSING || item.status === ImportStatus.QUEUED) return;
                        setSelectedImport(item);
                        setIsDetailOpen(true);
                    }}
                />

                {!isLoading && history && history.length > 0 && (
                    <div className="px-6 py-6 border-t border-gray-50 flex items-center justify-between">
                        <span className="text-sm text-gray-400 font-medium">Hiển thị 1 - {history.length} trong {totalItems}</span>
                        <div className="flex items-center gap-2">
                             <button 
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-2 hover:bg-gray-50 rounded-lg text-gray-400 disabled:opacity-20"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
                            </button>
                            <span className="w-8 h-8 flex items-center justify-center bg-blue-500 text-white rounded-lg text-sm font-bold shadow-lg shadow-blue-100">{currentPage}</span>
                            <button 
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="p-2 hover:bg-gray-50 rounded-lg text-gray-400 disabled:opacity-20"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
                            </button>
                        </div>
                    </div>
                )}
                {!isLoading && history.length === 0 && (
                    <div className="p-12 text-center text-gray-400 font-medium italic">Không tìm thấy dữ liệu.</div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Thành công', count: stats?.completedCount || 0, icon: <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></>, color: 'text-green-500', bg: 'bg-green-50/50', iconBg: 'bg-green-100/50' },
                    { label: 'Lỗi xử lý', count: stats?.failedCount || 0, icon: <><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></>, color: 'text-red-500', bg: 'bg-red-50/50', iconBg: 'bg-red-100/50' },
                    { label: 'Đang chờ', count: stats?.pendingApprovalCount || 0, icon: <><circle cx="12" cy="12" r="10"></circle><path d="M8 12h0"></path><path d="M12 12h0"></path><path d="M16 12h0"></path></>, color: 'text-blue-500', bg: 'bg-blue-50/50', iconBg: 'bg-blue-100/50' },
                    { label: 'Đã hoàn tác', count: 0, icon: <><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></>, color: 'text-gray-500', bg: 'bg-gray-50/50', iconBg: 'bg-gray-200/50' },
                ].map((stat, idx) => (
                    <div key={idx} className={`${stat.bg} rounded-3xl p-6 flex items-center gap-5 transition-transform hover:scale-[1.02]`}>
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${stat.iconBg} ${stat.color}`}>
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                {stat.icon}
                            </svg>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">{stat.label}</p>
                            <p className="text-3xl font-black text-gray-900 leading-none">{stat.count}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
