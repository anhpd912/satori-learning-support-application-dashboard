'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import CommonTable, { Column } from '@/shared/components/CommonTable';
import Pagination from '@/shared/components/Pagination';
import ConfirmModal from '@/shared/components/ConfirmModal';
import Toast from '@/shared/components/Toast';
import CourseFilters from '@/features/courses/components/CourseFilters';
import PageHeader from '@/shared/components/PageHeader';
import { Course } from '@/features/courses/services/course.service';
import { useCourseList, ITEMS_PER_PAGE } from '@/features/courses/hooks/useCourseList';

export default function CourseListClient() {
    const router = useRouter();

    const {
        searchTerm, setSearchTerm,
        levelFilter, setLevelFilter,
        statusFilter, setStatusFilter,
        currentPage, setCurrentPage,
        courses,
        totalItems,
        isLoading,
        deleteCourseId, setDeleteCourseId,
        isDeleting,
        toast, setToast,
        confirmDelete
    } = useCourseList();

    const columns = useMemo<Column<Course>[]>(() => [
        {
            header: 'Tên',
            render: (course) => (
                <div className="flex items-center gap-3">

                    <span className="font-semibold text-gray-900 text-sm">{course.name}</span>
                </div>
            )
        },
        {
            header: 'Level',
            render: (course) => (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                    {course.jlptLevel}
                </span>
            )
        },
        {
            header: 'Số bài học',
            render: (course) => (
                <span className="text-sm text-gray-600 font-medium">
                    {course.lessonCount}
                </span>
            )
        },
        {
            header: 'Trạng thái',
            render: (course) => {
                const getStatusStyle = (status: string) => {
                    switch (status) {
                        case 'ACTIVE': return { class: 'bg-green-100 text-green-700', text: 'ACTIVE' };
                        case 'INACTIVE': return { class: 'bg-orange-100 text-orange-700', text: 'INACTIVE' };
                        default: return { class: 'bg-gray-100 text-gray-600', text: status };
                    }
                };
                const statusInfo = getStatusStyle(course.status);
                return (
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${statusInfo.class}`}>
                        {statusInfo.text}
                    </span>
                );
            }
        },
        {
            header: 'Hành động',
            className: 'text-right',
            render: (course) => (
                <div className="flex items-center justify-end gap-4 text-gray-400">
                    <button
                        title="Xem chi tiết"
                        className="hover:text-blue-600 transition-colors"
                        onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/courses/${course.id}`);
                        }}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                    </button>

                    <button
                        title="Chỉnh sửa"
                        className="hover:text-gray-900 transition-colors"
                        onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/courses/${course.id}/update`);
                        }}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                    </button>


                    <button
                        title="Xóa"
                        className="hover:text-red-500 transition-colors"
                        onClick={(e) => {
                            e.stopPropagation();
                            setDeleteCourseId(course.id);
                        }}
                    >
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg"><g clipPath="url(#clip0_1177_405)"><path d="M2.25 4.5H15.75M14.25 4.5V15C14.25 15.75 13.5 16.5 12.75 16.5H5.25C4.5 16.5 3.75 15.75 3.75 15V4.5M6 4.5V3C6 2.25 6.75 1.5 7.5 1.5H10.5C11.25 1.5 12 2.25 12 3V4.5M7.5 8.25V12.75M10.5 8.25V12.75" stroke="#F87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></g><defs><clipPath id="clip0_1177_405"><rect width="18" height="18" fill="white" /></clipPath></defs></svg>

                    </button>
                </div>
            )
        }
    ], [router, setDeleteCourseId]);

    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

    return (
        <div className="p-8 bg-gray-50 min-h-screen font-sans w-full">

            {/* Component Thông báo */}
            <Toast
                message={toast.message} type={toast.type}
                isVisible={toast.isVisible} onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
            />

            {/* Component Xác nhận Lưu trữ/Xóa */}
            <ConfirmModal
                isOpen={!!deleteCourseId}
                onClose={() => setDeleteCourseId(null)}
                onConfirm={confirmDelete}
                title="Xóa khóa học?"
                message="Khóa học này sẽ bị xóa vĩnh viễn và không thể khôi phục. Bạn có chắc chắn không?"
                confirmText="Xóa"
                variant="danger"
                isLoading={isDeleting}
            />

            <PageHeader
                title="Danh sách khóa học"
                action={
                    <Link href="/courses/create">
                        <button className="px-4 py-2.5 bg-[#253A8C] hover:bg-[#1e2e70] text-white text-sm font-medium rounded-lg shadow-sm transition-all flex items-center gap-2">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
                            Tạo khóa học mới
                        </button>
                    </Link>
                }
            />

            <CourseFilters
                searchTerm={searchTerm}
                setSearchTerm={(val) => { setSearchTerm(val); setCurrentPage(1); }}

                levelFilter={levelFilter}
                setLevelFilter={(val) => { setLevelFilter(val); setCurrentPage(1); }}

                statusFilter={statusFilter}
                setStatusFilter={(val) => { setStatusFilter(val); setCurrentPage(1); }}
            />

            {/* BẢNG DỮ LIỆU SỬ DỤNG COMPONENT CHUNG */}
            <div className="mt-4 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <CommonTable
                    data={courses}
                    columns={columns}
                    keyExtractor={(item) => item.id}
                    isLoading={isLoading}
                    onRowClick={(course) => router.push(`/courses/${course.id}`)}
                />

                {/* PHÂN TRANG */}
                {!isLoading && courses.length > 0 && (
                    <div className="border-t border-gray-200 bg-gray-50">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                            totalItems={totalItems}
                            itemsPerPage={ITEMS_PER_PAGE}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
