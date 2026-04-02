'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

import CommonTable, { Column } from '@/shared/components/CommonTable';
import Pagination from '@/shared/components/Pagination';
import ConfirmModal from '@/shared/components/ConfirmModal';
import Toast, { ToastType } from '@/shared/components/Toast';
import ClassFilters from '@/features/classes/components/ClassFilters';
import { ClassModel } from '@/shared/types/class';

import { useClasses, useDeleteClass } from '@/features/classes/hooks/useClasses';
import { useUsers } from '@/features/users/hooks/useUsers';
import { usePublicCourses } from '@/features/courses/hooks/useCourses';

const ITEMS_PER_PAGE = 5;

export default function ClassListClient() {
    const router = useRouter();

    // States cho Filter
    const [searchTerm, setSearchTerm] = useState('');
    const [teacherFilter, setTeacherFilter] = useState('Tất cả');
    const [courseFilter, setCourseFilter] = useState('Tất cả');
    const [statusFilter, setStatusFilter] = useState('Tất cả');
    
    // States cho Pagination 
    const [currentPage, setCurrentPage] = useState(1);

    // States cho Modal Xóa
    const [deleteClassId, setDeleteClassId] = useState<string | null>(null);
    const [toast, setToast] = useState<{ message: string; type: ToastType; isVisible: boolean }>({
        message: '', type: 'success', isVisible: false
    });

    // 1. Fetch Danh sách khóa học & giảng viên (Cho bộ lọc)
    const { data: teachersRes } = useUsers(1, 100, '', 'TEACHER', 'ACTIVE');
    const { data: publicCoursesData } = usePublicCourses();
    
    const teacherOptions = teachersRes?.data.map(t => ({ label: t.name, value: t.id })) || [];
    const courseOptions = publicCoursesData?.map(c => ({ label: c.name, value: c.id })) || [];

    // 2. Fetch danh sách lớp học (Table Data)
    const { data: classRes, isPending: isLoading, isError } = useClasses(
        currentPage,
        ITEMS_PER_PAGE,
        searchTerm,
        statusFilter,
        courseFilter,
        teacherFilter
    );

    const classes = classRes?.data || [];
    const totalItems = classRes?.total || 0;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

    // 3. Mutation Xóa lớp học
    const { mutateAsync: deleteClassAsync, isPending: isDeleting } = useDeleteClass();

    if (isError) {
       // Optional: return error fallback ui
    }

    const confirmDelete = async () => {
        if (!deleteClassId) return;
        try {
            await deleteClassAsync(deleteClassId);
            setToast({ message: 'Xóa lớp học thành công', type: 'success', isVisible: true });
            setDeleteClassId(null);
            
            // Xử lý lùi trang nếu xóa item cuối cùng của trang
            if (classes.length === 1 && currentPage > 1) {
                setCurrentPage(p => p - 1);
            }
        } catch (err: any) {
            setToast({ message: err.message || 'Lỗi khi xóa lớp học', type: 'error', isVisible: true });
        }
    };

    // 4. Định nghĩa Cột (Columns)
    const columns = React.useMemo<Column<ClassModel>[]>(() => [
        {
            header: 'Tên lớp',
            render: (cls: ClassModel) => <span className="font-bold text-gray-900 text-sm">{cls.name}</span>
        },
        {
            header: 'Khóa',
            render: (cls: ClassModel) => (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-600">
                    {cls.course}
                </span>
            )
        },
        {
            header: 'Giảng viên',
            accessor: 'teacherName',
            className: 'text-sm font-semibold text-gray-800'
        },
        {
            header: 'Số học viên',
            render: (cls: ClassModel) => (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                    {cls.studentCount}{cls.maxStudents != null ? `/${cls.maxStudents}` : ''}
                </span>
            )
        },
        {
            header: 'Trạng thái',
            render: (cls: ClassModel) => {
                const isActive = cls.status === 'Active';
                return (
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                        isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                        {cls.status}
                    </span>
                );
            }
        },
        {
            header: 'Hành động',
            className: 'text-right',
            render: (cls: ClassModel) => (
                <div className="flex items-center justify-end gap-4 text-gray-400">
                    <button onClick={(e) => { e.stopPropagation(); router.push(`/classes/${cls.id}`); }} className="hover:text-gray-900 transition-colors" title="Xem">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); router.push(`/classes/${cls.id}/edit`); }} className="hover:text-blue-600 transition-colors" title="Sửa">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); setDeleteClassId(cls.id); }} className="hover:text-red-500 transition-colors" title="Xóa">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                </div>
            )
        }
    ], [router]);

    return (
        <React.Fragment>
            <Toast 
                message={toast.message} type={toast.type} 
                isVisible={toast.isVisible} onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
            />

            <ConfirmModal 
                isOpen={!!deleteClassId}
                onClose={() => setDeleteClassId(null)}
                onConfirm={confirmDelete}
                title="Xóa lớp học?"
                message="Bạn có chắc chắn muốn xóa lớp học này không? Hành động này không thể hoàn tác."
                confirmText="Xóa"
                variant="danger"
                isLoading={isDeleting}
            />

            {/* BỘ LỌC */}
            <ClassFilters 
                searchTerm={searchTerm} setSearchTerm={(val) => { setSearchTerm(val); setCurrentPage(1); }}
                teacherFilter={teacherFilter} setTeacherFilter={(val) => { setTeacherFilter(val); setCurrentPage(1); }}
                courseFilter={courseFilter} setCourseFilter={(val) => { setCourseFilter(val); setCurrentPage(1); }}
                statusFilter={statusFilter} setStatusFilter={(val) => { setStatusFilter(val); setCurrentPage(1); }}
                teachers={teacherOptions}
                courses={courseOptions}
            />

            {/* TABLE & PHÂN TRANG */}
            <div className="mt-4">
                <CommonTable 
                    data={classes} 
                    columns={columns} 
                    keyExtractor={(item) => item.id}
                    isLoading={isLoading} 
                    onRowClick={(cls) => router.push(`/classes/${cls.id}`)}
                />
                
                {!isLoading && classes.length > 0 && (
                    <Pagination 
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        totalItems={totalItems}
                        itemsPerPage={ITEMS_PER_PAGE}
                    />
                )}
            </div>
        </React.Fragment>
    );
}
