'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import CommonTable, { Column } from '@/shared/components/CommonTable';
import Pagination from '@/shared/components/Pagination';
import ConfirmModal from '@/shared/components/ConfirmModal';
import Toast, { ToastType } from '@/shared/components/Toast';
import ClassFilters from '@/shared/features/classes/components/ClassFilters';
import { classService, ClassModel } from '@/shared/services/class.service';
import { userService } from '@/shared/services/user.service';
import { courseService } from '@/app/(manager)/courses/services/course.service';
import { FilterOption } from '@/shared/components/FilterDropdown';

const ITEMS_PER_PAGE = 5;

export default function ClassListPage() {
    const router = useRouter();

    // States cho Filter
    const [searchTerm, setSearchTerm] = useState('');
    const [teacherFilter, setTeacherFilter] = useState('Tất cả');
    const [courseFilter, setCourseFilter] = useState('Tất cả');
    const [statusFilter, setStatusFilter] = useState('Tất cả');
    
    // States cho Pagination & Data
    const [currentPage, setCurrentPage] = useState(1);
    const [classes, setClasses] = useState<ClassModel[]>([]);
    const [totalItems, setTotalItems] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    const [teacherOptions, setTeacherOptions] = useState<FilterOption[]>([]);
    const [courseOptions, setCourseOptions] = useState<FilterOption[]>([]);

    // States cho Modal Xóa
    const [deleteClassId, setDeleteClassId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: ToastType; isVisible: boolean }>({
        message: '', type: 'success', isVisible: false
    });

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const response = await classService.getClasses(
                currentPage,
                ITEMS_PER_PAGE,
                searchTerm,
                statusFilter,
                courseFilter,
                teacherFilter
            );
            setClasses(response.data);
            setTotalItems(response.total);
        } catch (error) {
            setToast({ message: 'Lỗi tải dữ liệu lớp học', type: 'error', isVisible: true });
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch danh sách Giảng viên và Khóa học cho bộ lọc
    useEffect(() => {
        const fetchFilterData = async () => {
            try {
                // Lấy danh sách giảng viên (Role: TEACHER, Status: ACTIVE)
                const teachersRes = await userService.getUsers(1, 100, '', 'TEACHER', 'ACTIVE');
                setTeacherOptions(teachersRes.data.map(t => ({ label: t.name, value: t.id })));

                // Lấy danh sách khóa học (Status: OPEN)
                const coursesRes = await courseService.getCourses(1, 100, '', 'ALL', 'OPEN');
                setCourseOptions(coursesRes.data.map(c => ({ label: c.name, value: c.id })));
            } catch (error) {
                console.error('Lỗi khi tải dữ liệu bộ lọc:', error);
            }
        };
        fetchFilterData();
    }, []);

    useEffect(() => {
        fetchData();
    }, [currentPage, searchTerm, teacherFilter, courseFilter, statusFilter]);

    const confirmDelete = async () => {
        if (!deleteClassId) return;
        setIsDeleting(true);
        try {
            await classService.deleteClass(deleteClassId);
            setToast({ message: 'Xóa lớp học thành công', type: 'success', isVisible: true });
            setDeleteClassId(null);
            fetchData();
        } catch (err: any) {
            setToast({ message: err.message || 'Lỗi khi xóa lớp học', type: 'error', isVisible: true });
        } finally {
            setIsDeleting(false);
        }
    };

    // 2. Định nghĩa Cột (Columns)
    const columns = useMemo<Column<ClassModel>[]>(() => [
        {
            header: 'Tên lớp',
            render: (cls) => <span className="font-bold text-gray-900 text-sm">{cls.name}</span>
        },
        {
            header: 'Khóa',
            render: (cls) => (
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
            render: (cls) => (
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 text-gray-600 text-xs font-semibold">
                    {cls.studentCount}
                </span>
            )
        },
        {
            header: 'Trạng thái',
            render: (cls) => {
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
            render: (cls) => (
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

    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

    return (
        <div className="p-8 bg-gray-50 min-h-screen font-sans w-full">
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

            {/* HEADER */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Danh sách lớp học</h1>
                <Link href="/classes/create">
                    <button className="px-4 py-2.5 bg-[#253A8C] hover:bg-[#1e2e70] text-white text-sm font-medium rounded-lg shadow-sm transition-all flex items-center gap-2">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
                        Tạo lớp học mới
                    </button>
                </Link>
            </div>

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
                
                {/* Check an toàn để tránh lỗi undefined length bạn từng gặp */}
                {!isLoading && classes && classes.length > 0 && (
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