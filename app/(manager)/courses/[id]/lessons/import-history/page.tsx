'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

import CommonTable, { Column } from '@/shared/components/CommonTable';
import Pagination from '@/shared/components/Pagination';
import PageHeader from '@/shared/components/PageHeader';
import Toast, { ToastType } from '@/shared/components/Toast';

// ==========================================
// 1. INTERFACES & MOCK DATA
// ==========================================
interface ImportHistoryItem {
    id: string;
    importCode: string;
    fileName: string;
    time: string;
    vocabCount?: number;
    grammarCount?: number;
    status: 'Đang xử lý' | 'Thành công' | 'Lỗi' | 'Đã Rollback';
}

const MOCK_HISTORY: ImportHistoryItem[] = [
    { id: '1', importCode: '#IMP-20231020-02', fileName: 'Minna_N5_Dich.pdf', time: '20/10/2023 15:15', status: 'Đang xử lý' },
    { id: '2', importCode: '#IMP-20231020-01', fileName: 'Minna_N5.pdf', time: '20/10/2023 14:30', vocabCount: 45, grammarCount: 5, status: 'Thành công' },
    { id: '3', importCode: '#IMP-20231021-01', fileName: 'Minna_N5.pdf', time: '21/10/2023 09:00', status: 'Lỗi' },
    { id: '4', importCode: '#IMP-20231019-05', fileName: 'Minna_N4.pdf', time: '19/10/2023 10:20', status: 'Đã Rollback' },
    { id: '5', importCode: '#IMP-20231018-09', fileName: 'Minna_N5_Dich.pdf', time: '18/10/2023 16:45', status: 'Lỗi' },
];

const ITEMS_PER_PAGE = 5;

// ==========================================
// 2. MAIN COMPONENT
// ==========================================
export default function ImportHistoryPage() {
    const router = useRouter();
    const params = useParams();
    const courseId = params?.id as string;

    const [historyInfo, setHistoryInfo] = useState<ImportHistoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [toast, setToast] = useState<{ message: string; type: ToastType; isVisible: boolean }>({
        message: '', type: 'success', isVisible: false
    });

    const totalItems = historyInfo.length;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

    // --- GỌI API BAN ĐẦU ---
    useEffect(() => {
        const fetchHistory = async () => {
            setIsLoading(true);
            try {
                // Giả lập API call
                await new Promise(resolve => setTimeout(resolve, 500));
                setHistoryInfo(MOCK_HISTORY);
            } catch (error) {
                setToast({ message: 'Lỗi tải lịch sử nhập', type: 'error', isVisible: true });
            } finally {
                setIsLoading(false);
            }
        };
        fetchHistory();
    }, [courseId]);

    // Helpers render Badge trạng thái
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Đang xử lý':
                return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">Đang xử lý <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span></span>;
            case 'Thành công':
                return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">Thành công <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span></span>;
            case 'Lỗi':
                return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">Lỗi <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span></span>;
            case 'Đã Rollback':
                return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gray-200 text-gray-700">Đã Rollback <span className="w-1.5 h-1.5 rounded-full bg-gray-500"></span></span>;
            default:
                return null;
        }
    };

    // Định nghĩa cột
    const columns = useMemo<Column<ImportHistoryItem>[]>(() => [
        {
            header: 'Mã Import',
            render: (item) => <span className="text-gray-500 font-medium text-sm">{item.importCode}</span>
        },
        {
            header: 'Tên File / Bài học',
            render: (item) => <span className="font-bold text-gray-900 text-sm">{item.fileName}</span>
        },
        {
            header: 'Thời gian',
            render: (item) => <span className="text-gray-500 text-sm">{item.time}</span>
        },
        {
            header: 'Kết quả bóc tách',
            render: (item) => {
                if (item.status === 'Đang xử lý') {
                    return <span className="text-gray-400 italic text-sm">Đang bóc tách...</span>;
                }
                if (item.status === 'Thành công') {
                    return (
                        <div className="flex flex-col gap-1">
                            <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-600 text-xs font-semibold rounded">{item.vocabCount} Từ vựng</span>
                            <span className="inline-block px-2 py-0.5 bg-purple-50 text-purple-600 text-xs font-semibold rounded">{item.grammarCount} Ngữ pháp</span>
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
                    <button className="hover:text-gray-900 transition-colors" title="Xem chi tiết">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    </button>
                    {(item.status === 'Thành công' || item.status === 'Lỗi') && (
                        <button className="hover:text-red-500 transition-colors" title="Rollback">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v6h6"></path><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"></path></svg>
                        </button>
                    )}
                </div>
            )
        }
    ], []);

    const filteredData = useMemo(() => {
        return historyInfo.filter(item => 
            item.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.importCode.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [historyInfo, searchTerm]);

    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredData.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredData, currentPage]);

    return (
        <div className="p-8 bg-gray-50 min-h-screen font-sans w-full pb-20">
            <Toast message={toast.message} type={toast.type} isVisible={toast.isVisible} onClose={() => setToast(prev => ({ ...prev, isVisible: false }))} />

            {/* HEADER */}
            <PageHeader 
                breadcrumb={[
                    { label: 'Quản lí khóa học', href: '/courses' },
                    { label: 'N1', href: `/courses/${courseId}` },
                    { label: 'Quản lý nội dung bài học', href: `/courses/${courseId}/lessons` },
                    { label: 'Lịch sử nhập giáo trình', active: true }
                ]}
                backUrl={`/courses/${courseId}/lessons`} 
                title="Lịch sử nhập giáo trình"
                description="Theo dõi và quản lý kết quả xử lý dữ liệu học liệu tự động"
            />

            {/* TOOLBAR */}
            <div className="flex gap-4 mb-6">
                <div className="flex-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>
                    <input 
                        type="text" 
                        placeholder="Tìm kiếm theo tên file..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#253A8C] text-sm text-gray-900 placeholder-gray-400 font-medium shadow-sm"
                    />
                </div>
                
                <div className="flex gap-4">
                    <div className="relative w-64">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                        </div>
                        <input 
                            type="text" 
                            placeholder="Chọn khoảng thời gian..." 
                            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#253A8C] text-sm text-gray-900 placeholder-gray-400 font-medium shadow-sm cursor-pointer"
                            readOnly
                        />
                    </div>
                    <button className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 shadow-sm transition-all">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
                        Lọc
                    </button>
                </div>
            </div>

            {/* BẢNG DỮ LIỆU */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8">
                <CommonTable 
                    data={paginatedData} 
                    columns={columns} 
                    keyExtractor={(item) => item.id} 
                    isLoading={isLoading} 
                />
                
                {!isLoading && filteredData.length > 0 && (
                    <Pagination 
                        currentPage={currentPage} 
                        totalPages={Math.ceil(filteredData.length / ITEMS_PER_PAGE)} 
                        onPageChange={setCurrentPage} 
                        totalItems={filteredData.length} 
                        itemsPerPage={ITEMS_PER_PAGE} 
                    />
                )}
                {!isLoading && filteredData.length === 0 && (
                    <div className="p-8 text-center text-gray-500">Không tìm thấy dữ liệu.</div>
                )}
            </div>

            {/* THỐNG KÊ NHANH */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Thành công', count: 18, icon: <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></>, color: 'text-green-600', bg: 'bg-green-50' },
                    { label: 'Lỗi xử lý', count: 3, icon: <><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></>, color: 'text-red-600', bg: 'bg-red-50' },
                    { label: 'Đang chờ', count: 1, icon: <><circle cx="12" cy="12" r="10"></circle><path d="M8 12h0"></path><path d="M12 12h0"></path><path d="M16 12h0"></path></>, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Đã hoàn tác', count: 2, icon: <><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></>, color: 'text-gray-600', bg: 'bg-gray-100' },
                ].map((stat, idx) => (
                    <div key={idx} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${stat.bg} ${stat.color}`}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                {stat.icon}
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-500 mb-0.5">{stat.label}</p>
                            <p className="text-2xl font-bold text-gray-900">{stat.count}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
