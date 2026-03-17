'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';

import CommonTable, { Column } from '@/shared/components/CommonTable';
import Pagination from '@/shared/components/Pagination';
import FilterDropdown from '@/shared/components/FilterDropdown';
import PageHeader from '@/shared/components/PageHeader';
import Toast, { ToastType } from '@/shared/components/Toast';
import { curriculumImportService, LessonSummaryDto } from '@/shared/services/curriculumImport.service';

// 1. Interface
export interface LessonItem {
    id: string;
    title: string;
    vocabCount: number;
    grammarCount: number;
    status: 'OPEN' | 'DRAFT' | 'ARCHIVED' | 'AI_DRAFT';
}

const ITEMS_PER_PAGE = 10;

export default function LessonListPage() {
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();
    
    const courseId = params?.id as string;
    const importId = searchParams?.get('importId');

    const [courseName, setCourseName] = useState('N1');

    // States cho Filter
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('Tất cả');
    const statusOptions = ['Tất cả', 'Đang mở', 'Bản nháp', 'Đã lưu trữ'];
    
    // States cho Pagination & Data
    const [currentPage, setCurrentPage] = useState(1);
    const [lessons, setLessons] = useState<LessonItem[]>([]);
    const [totalItems, setTotalItems] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isActionLoading, setIsActionLoading] = useState(false);

    const [toast, setToast] = useState<{ message: string; type: ToastType; isVisible: boolean }>({
        message: '', type: 'success', isVisible: false
    });

    const fetchData = async () => {
        setIsLoading(true);
        try {
            if (importId) {
                // Chế độ Review: Lấy bài học từ đợt Import
                const data = await curriculumImportService.getImportLessons(importId);
                const mapped: LessonItem[] = data.map(l => ({
                    ...l,
                    status: 'AI_DRAFT'
                }));
                setLessons(mapped);
                setTotalItems(mapped.length);
            } else {
                // Chế độ bình thường: TODO gọi API lấy lessons theo courseId
                // Hiện tại vẫn dùng Mock cho phần không liên quan import
                const MOCK_LESSONS: LessonItem[] = [
                    { id: '1', title: 'Bài 1', vocabCount: 36, grammarCount: 15, status: 'OPEN' },
                ];
                setLessons(MOCK_LESSONS);
                setTotalItems(MOCK_LESSONS.length);
            }
        } catch (error: any) {
            setToast({ message: error.message || 'Lỗi tải dữ liệu bài học', type: 'error', isVisible: true });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [currentPage, searchTerm, statusFilter, courseId, importId]);

    const handleApproveImport = async () => {
        if (!importId) return;
        setIsActionLoading(true);
        try {
            await curriculumImportService.approveImport(importId);
            setToast({ message: 'Đã phê duyệt tất cả bài học thành công!', type: 'success', isVisible: true });
            router.push(`/courses/${courseId}/lessons`);
        } catch (error: any) {
            setToast({ message: error.message, type: 'error', isVisible: true });
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleRejectImport = async () => {
        if (!importId) return;
        if (!confirm('Bạn có chắc chắn muốn hủy bỏ toàn bộ kết quả import này?')) return;
        
        setIsActionLoading(true);
        try {
            await curriculumImportService.rejectImport(importId);
            setToast({ message: 'Đã hủy bỏ kết quả import.', type: 'success', isVisible: true });
            router.push(`/courses/${courseId}/lessons`);
        } catch (error: any) {
            setToast({ message: error.message, type: 'error', isVisible: true });
        } finally {
            setIsActionLoading(false);
        }
    };

    // Helpers render Badge
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'OPEN':
                return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">Đang mở</span>;
            case 'DRAFT':
                return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700">Bản nháp</span>;
            case 'ARCHIVED':
                return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-500">Đã lưu trữ</span>;
            case 'AI_DRAFT':
                return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700">Bản nháp AI</span>;
            default:
                return null;
        }
    };

    const columns = useMemo<Column<LessonItem>[]>(() => [
        {
            header: 'Tiêu đề',
            render: (lesson) => <span className="font-bold text-gray-900 text-sm">{lesson.title}</span>
        },
        {
            header: 'Từ vựng',
            render: (lesson) => (
                <span className="inline-flex items-center justify-center w-9 h-6 rounded-full bg-gray-100 text-gray-600 text-xs font-semibold">
                    {lesson.vocabCount}
                </span>
            )
        },
        {
            header: 'Ngữ pháp',
            render: (lesson) => (
                <span className="inline-flex items-center justify-center w-9 h-6 rounded-full bg-gray-100 text-gray-600 text-xs font-semibold">
                    {lesson.grammarCount}
                </span>
            )
        },
        {
            header: 'Trạng thái',
            render: (lesson) => getStatusBadge(lesson.status)
        },
        {
            header: 'Hành động',
            className: 'text-right',
            render: (lesson) => (
                <div className="flex items-center justify-end gap-3 text-gray-400">
                    <button 
                        onClick={(e) => { e.stopPropagation(); router.push(`/courses/${courseId}/lessons/${lesson.id}${importId ? `?importId=${importId}` : ''}`); }} 
                        className="hover:text-gray-900 transition-colors" title="Xem chi tiết"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    </button>
                    {!importId && (
                        <>
                            <button 
                                onClick={(e) => { e.stopPropagation(); router.push(`/courses/${courseId}/lessons/${lesson.id}/edit`); }} 
                                className="hover:text-blue-600 transition-colors" title="Sửa"
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                            </button>
                            <button 
                                onClick={(e) => { e.stopPropagation(); /* TODO: Gọi Modal Xóa/Lưu trữ */ }} 
                                className="hover:text-red-500 transition-colors" title="Lưu trữ/Xóa"
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                            </button>
                        </>
                    )}
                </div>
            )
        }
    ], [router, courseId, importId]);

    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

    const Breadcrumb = (
        <div className="flex items-center gap-2">
            <Link href="/courses" className="hover:text-gray-900 transition-colors">Quản lí khóa học</Link>
            <span className="mx-1 text-gray-400">{'>'}</span> 
            <Link href={`/courses/${courseId}`} className="hover:text-gray-900 transition-colors">{courseName}</Link>
            <span className="mx-1 text-gray-400">{'>'}</span> 
            {importId ? (
                <>
                    <Link href={`/courses/${courseId}/lessons`} className="hover:text-gray-900 transition-colors">Quản lý bài học</Link>
                    <span className="mx-1 text-gray-400">{'>'}</span> 
                    <span className="text-gray-900 font-medium">Review Import</span>
                </>
            ) : (
                <span className="text-gray-900 font-medium">Quản lý nội dung bài học</span>
            )}
        </div>
    );

    return (
        <div className="p-8 bg-gray-50 min-h-screen font-sans w-full pb-20">
            <Toast 
                message={toast.message} type={toast.type} 
                isVisible={toast.isVisible} onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
            />

            {/* HEADER */}
            <PageHeader 
                breadcrumb={Breadcrumb}
                backUrl={`/courses/${courseId}${importId ? '/lessons/import-history' : ''}`} 
                title={importId ? "Review kết quả Import" : "Quản lý nội dung bài học"}
                description={importId ? "Vui lòng kiểm tra kỹ các bài học AI đã tự động bóc tách trước khi phê duyệt." : ""}
            />

            {/* REVIEW BANNER */}
            {importId && (
                <div className="bg-indigo-600 rounded-2xl p-6 mb-8 text-white flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg shadow-indigo-100 animate-in fade-in slide-in-from-top-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">Chế độ Review dữ liệu AI</h3>
                            <p className="text-indigo-100 text-sm">Bạn đang xem {lessons.length} bài học vừa được tạo. Hãy nhấn "Phê duyệt" để chính thức thêm vào khóa học.</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button 
                            onClick={handleRejectImport}
                            disabled={isActionLoading}
                            className="px-6 py-2.5 bg-white/10 hover:bg-white/20 border border-white/30 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
                        >
                            Hủy toàn bộ
                        </button>
                        <button 
                            onClick={handleApproveImport}
                            disabled={isActionLoading}
                            className="px-6 py-2.5 bg-white text-indigo-600 hover:bg-indigo-50 rounded-xl text-sm font-bold shadow-md transition-all disabled:opacity-50 flex items-center gap-2"
                        >
                            {isActionLoading ? 'Đang xử lý...' : 'Phê duyệt tất cả'}
                            {!isActionLoading && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                        </button>
                    </div>
                </div>
            )}

            {/* ACTION BUTTONS (Hidden in Review mode to focus) */}
            {!importId && (
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <button 
                        onClick={() => router.push(`/courses/${courseId}/lessons/import-ai`)}
                        className="px-5 py-2.5 bg-[#253A8C] hover:bg-[#1e2e70] text-white text-sm font-medium rounded-lg shadow-sm transition-all flex items-center justify-center gap-2"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                        Nhập giáo trình
                    </button>
                    <button 
                        onClick={() => router.push(`/courses/${courseId}/lessons/import-history`)}
                        className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium rounded-lg shadow-sm transition-all flex items-center justify-center gap-2"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8v4l3 3"></path><path d="M3.05 11a9 9 0 1 1 .5 4m-.5 5v-5h5"></path></svg>
                        Xem lịch sử nhập
                    </button>
                </div>
            )}

            {/* BỘ LỌC */}
            {!importId && (
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <label className="block text-xs font-medium text-gray-700 mb-1.5">Tìm kiếm</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                </div>
                                <input 
                                    type="text" 
                                    placeholder="Tìm kiếm bài học theo tiêu đề..." 
                                    value={searchTerm}
                                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#253A8C] text-sm text-gray-900 placeholder-gray-400"
                                />
                            </div>
                        </div>

                        <div className="w-full md:w-56">
                            <FilterDropdown 
                                label="Trạng thái"
                                options={statusOptions}
                                value={statusFilter}
                                onChange={(val) => { setStatusFilter(val); setCurrentPage(1); }}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* BẢNG DỮ LIỆU */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <CommonTable 
                    data={lessons} 
                    columns={columns} 
                    keyExtractor={(item) => item.id}
                    isLoading={isLoading} 
                    onRowClick={(lesson) => router.push(`/courses/${courseId}/lessons/${lesson.id}`)}
                />
                
                {!isLoading && lessons && lessons.length > 0 && (
                    
                        <Pagination 
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                            totalItems={totalItems}
                            itemsPerPage={ITEMS_PER_PAGE}
                        />
                )}
            </div>
        </div>
    );
}