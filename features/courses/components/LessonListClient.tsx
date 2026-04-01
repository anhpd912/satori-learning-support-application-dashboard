'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import CommonTable, { Column } from '@/shared/components/CommonTable';
import Pagination from '@/shared/components/Pagination';
import FilterDropdown from '@/shared/components/FilterDropdown';
import PageHeader from '@/shared/components/PageHeader';
import Toast, { ToastType } from '@/shared/components/Toast';
import { curriculumImportService } from '@/features/curriculum-import/services/curriculumImport.service';
import { lessonService } from '@/features/courses/services/lesson.service';
import { courseService } from '@/features/courses/services/course.service';
import ConfirmModal from '@/shared/components/ConfirmModal';
import AddLessonModal from './AddLessonModal';

export interface LessonItem {
    id: string;
    title: string;
    vocabCount: number;
    grammarCount: number;
    status: 'OPEN' | 'DRAFT' | 'ARCHIVED' | 'AI_DRAFT';
}

const ITEMS_PER_PAGE = 10;

interface LessonListClientProps {
    courseId: string;
    importId?: string | null;
}

export default function LessonListClient({ courseId, importId }: LessonListClientProps) {
    const router = useRouter();

    const [courseName, setCourseName] = useState('...');

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

    const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean, action: 'approve' | 'reject' | null }>({
        isOpen: false, action: null
    });
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            // Lấy thông tin khóa học
            const courseData = await courseService.getCourseById(courseId);
            setCourseName(courseData.name);

            if (importId) {
                // Chế độ Review: Lấy bài học từ đợt Import
                const data = await curriculumImportService.getImportLessons(importId);
                const mapped: LessonItem[] = data.map(l => ({
                    id: l.id,
                    title: l.title,
                    vocabCount: l.vocabularyCount,
                    grammarCount: l.grammarPointCount,
                    status: 'AI_DRAFT'
                }));
                setLessons(mapped);
                setTotalItems(mapped.length);
            } else {
                // Chế độ bình thường: Gọi API lấy lessons theo courseId
                const data = await lessonService.getLessonsByCourseId(
                    courseId, 
                    currentPage - 1, 
                    ITEMS_PER_PAGE, 
                    searchTerm
                );
                
                const mapped: LessonItem[] = data.content.map(l => ({
                    id: l.id,
                    title: l.title,
                    vocabCount: l.vocabularyCount,
                    grammarCount: l.grammarPointCount,
                    status: l.status === 'PUBLISHED' ? 'OPEN' : l.status as any
                }));
                
                setLessons(mapped);
                setTotalItems(data.totalElements);
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

    const handleConfirmApprove = () => setConfirmModal({ isOpen: true, action: 'approve' });
    const handleConfirmReject = () => setConfirmModal({ isOpen: true, action: 'reject' });

    const executeConfirmAction = async () => {
        if (!importId || !confirmModal.action) return;
        
        setIsActionLoading(true);
        const action = confirmModal.action;
        setConfirmModal({ isOpen: false, action: null });

        try {
            if (action === 'approve') {
                await curriculumImportService.approveImport(importId);
                setToast({ message: 'Đã phê duyệt tất cả bài học thành công!', type: 'success', isVisible: true });
            } else {
                await curriculumImportService.rejectImport(importId);
                setToast({ message: 'Đã hủy bỏ kết quả import.', type: 'success', isVisible: true });
            }
            router.push(`/courses/${courseId}/lessons`);
        } catch (error: any) {
            setToast({ message: error.message, type: 'error', isVisible: true });
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleArchiveLesson = async (lessonId: string) => {
        setIsActionLoading(true);
        try {
            await lessonService.archiveLesson(lessonId);
            setToast({ message: 'Lưu trữ bài học thành công!', type: 'success', isVisible: true });
            fetchData(); // Tải lại danh sách
        } catch (error: any) {
            console.error("Lỗi khi lưu trữ bài học:", error);
            setToast({ message: error.message || 'Lỗi khi lưu trữ bài học', type: 'error', isVisible: true });
        } finally {
            setIsActionLoading(false);
        }
    };

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
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                    </button>
                    {!importId && (
                        <>
                            {lesson.status === 'OPEN' && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleArchiveLesson(lesson.id); }}
                                    disabled={isActionLoading}
                                    className="hover:text-red-500 transition-colors disabled:opacity-50" title="Lưu trữ"
                                >
                                    {isActionLoading ? (
                                        <span className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></span>
                                    ) : (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                                    )}
                                </button>
                            )}
                        </>
                    )}
                </div>
            )
        }
    ], [router, courseId, importId]);

    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

    const breadcrumbItems = [
        { label: 'Quản lí khóa học', href: '/courses' },
        { label: courseName, href: `/courses/${courseId}` },
        ...(importId 
            ? [
                { label: 'Quản lý bài học', href: `/courses/${courseId}/lessons` },
                { label: 'Review Import', active: true }
              ]
            : [{ label: 'Quản lý nội dung bài học', active: true }]
        )
    ];

    return (
        <div className="p-8 bg-gray-50 min-h-screen font-sans w-full pb-20">
            <Toast
                message={toast.message} type={toast.type}
                isVisible={toast.isVisible} onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
            />

            <AddLessonModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                courseId={courseId}
                onSuccess={() => {
                    fetchData();
                    setToast({ message: 'Tạo bài học thành công!', type: 'success', isVisible: true });
                }}
            />

            {/* HEADER */}
            <PageHeader
                breadcrumb={breadcrumbItems as any}
                backUrl={`/courses/${courseId}`}
                title={importId ? 'Phê duyệt nội dung AI' : 'Quản lý nội dung bài học'}
            />

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ isOpen: false, action: null })}
                onConfirm={executeConfirmAction}
                title={confirmModal.action === 'approve' ? 'Xác nhận phê duyệt' : 'Xác nhận hủy bỏ'}
                message={
                    confirmModal.action === 'approve' 
                        ? 'Bạn có chắc chắn muốn phê duyệt tất cả bài học này không? Các bài học sẽ chuyển sang trạng thái chờ xuất bản.' 
                        : 'Bạn có chắc chắn muốn hủy bỏ toàn bộ kết quả import này không? Dữ liệu này sẽ không thể khôi phục.'
                }
                confirmText={confirmModal.action === 'approve' ? 'Phê duyệt' : 'Hủy bỏ'}
                variant={confirmModal.action === 'approve' ? 'info' : 'danger'}
                isLoading={isActionLoading}
            />

            {/* REVIEW BANNER */}
            {importId && (
                <div className="bg-indigo-600 rounded-2xl p-6 mb-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-indigo-100 border border-indigo-400 animate-in fade-in slide-in-from-top-4">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center shrink-0 border border-white/30 backdrop-blur-sm">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold mb-1">Đang trong chế độ Review (AI)</h2>
                            <p className="text-indigo-100 text-sm font-medium opacity-90">Vui lòng kiểm tra kỹ nội dung các bài học bên dưới trước khi phê duyệt chính thức.</p>
                        </div>
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                        <button
                            onClick={handleConfirmReject}
                            disabled={isActionLoading}
                            className="flex-1 md:flex-none px-6 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
                        >
                            {isActionLoading && confirmModal.action === 'reject' ? 'Đang xử lý...' : 'Hủy bỏ batch'}
                        </button>
                        <button
                            onClick={handleConfirmApprove}
                            disabled={isActionLoading}
                            className="flex-1 md:flex-none px-8 py-2.5 bg-white text-indigo-600 hover:bg-indigo-50 rounded-xl text-sm font-bold shadow-lg shadow-indigo-900/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {isActionLoading && confirmModal.action === 'approve' ? (
                                <span className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></span>
                            ) : (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            )}
                            Phê duyệt tất cả
                        </button>
                    </div>
                </div>
            )}

            {/* ACTION BUTTONS */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <button
                    onClick={() => router.push(`/courses/${courseId}/lessons/import-ai`)}
                    className="px-5 py-2.5 bg-[#253A8C] hover:bg-[#1e2e70] text-white text-sm font-medium rounded-lg shadow-sm transition-all flex items-center justify-center gap-2"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                    Nhập giáo trình
                </button>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg shadow-sm transition-all flex items-center justify-center gap-2"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    Thêm bài học mới
                </button>
                <button
                    onClick={() => router.push(`/courses/${courseId}/lessons/import-history`)}
                    className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium rounded-lg shadow-sm transition-all flex items-center justify-center gap-2"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8v4l3 3"></path><path d="M3.05 11a9 9 0 1 1 .5 4m-.5 5v-5h5"></path></svg>
                    Xem lịch sử nhập
                </button>
            </div>

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
                    onRowClick={(lesson) => router.push(`/courses/${courseId}/lessons/${lesson.id}${importId ? `?importId=${importId}` : ''}`)}
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
