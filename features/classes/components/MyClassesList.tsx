'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';

import CommonTable, { Column } from '@/shared/components/CommonTable';
import Pagination from '@/shared/components/Pagination';
import PageHeader from '@/shared/components/PageHeader';
import Toast, { ToastType } from '@/shared/components/Toast';
import ClassFilters from '@/features/classes/components/ClassFilters';
import { classService, ClassModel } from '@/features/classes/services/class.service';
import { courseService } from '@/features/courses/services/course.service';
import { FilterOption } from '@/shared/components/FilterDropdown';

const ITEMS_PER_PAGE = 5;

export default function MyClassesList() {
    const router = useRouter();

    // States cho Filter
    const [searchTerm, setSearchTerm] = useState('');
    const [courseFilter, setCourseFilter] = useState('Tất cả');
    const [statusFilter, setStatusFilter] = useState('Tất cả');

    // States cho Pagination & Data
    const [currentPage, setCurrentPage] = useState(1);
    const [user, setUser] = useState<any>(null);

    const [toast, setToast] = useState<{ message: string; type: ToastType; isVisible: boolean }>({
        message: '', type: 'success', isVisible: false
    });

    useEffect(() => {
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (error) {
                console.error('Error parsing user:', error);
            }
        }
    }, []);

    // Fetch course options cho filter
    const { data: courseOptionsData } = useQuery({
        queryKey: ['coursesOptions'],
        queryFn: async () => {
            const res = await courseService.getCourses(1, 100, '', 'ALL', 'ACTIVE');
            return res.data;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    const courseOptions = useMemo<FilterOption[]>(() => {
        return courseOptionsData?.map(c => ({ label: c.name, value: c.id })) || [];
    }, [courseOptionsData]);

    // Fetch classes using TanStack react-query
    const { data: classesData, isLoading, isError, error } = useQuery({
        queryKey: ['teacherClasses', currentPage, searchTerm, courseFilter, statusFilter, user?.id],
        queryFn: () => classService.getClasses(
            currentPage,
            ITEMS_PER_PAGE,
            searchTerm,
            statusFilter,
            courseFilter,
            user.id
        ),
        enabled: !!user,
    });

    useEffect(() => {
        if (isError && error) {
            setToast({ message: (error as any).message || 'Lỗi tải dữ liệu lớp học', type: 'error', isVisible: true });
        }
    }, [isError, error]);

    const classes = classesData?.data || [];
    const totalItems = classesData?.total || 0;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

    // Định nghĩa Cột (Columns)
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
            header: 'Số học viên',
            render: (cls) => (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                    {cls.studentCount}{cls.maxStudents != null ? `/${cls.maxStudents}` : ''}
                </span>
            )
        },
        {
            header: 'Trạng thái',
            render: (cls) => {
                const isActive = cls.status === 'Active';
                return (
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
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
                <div className="flex items-center justify-end">
                    <button
                        onClick={(e) => { e.stopPropagation(); router.push(`/my-classes/${cls.id}`); }}
                        className="text-gray-400 hover:text-[#253A8C] transition-colors"
                        title="Xem chi tiết"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                    </button>
                </div>
            )
        }
    ], [router]);

    return (
        <div className="p-8 bg-gray-50 min-h-screen font-sans w-full">
            <Toast
                message={toast.message} type={toast.type}
                isVisible={toast.isVisible} onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
            />

            {/* HEADER */}
            <PageHeader
                breadcrumb={
                    <span className="text-gray-900 font-medium">Lớp học của tôi</span>
                }
                title="Lớp học của tôi"
                description="Quản lý danh sách các lớp học được phân công giảng dạy."
            />

            {/* BỘ LỌC */}
            <ClassFilters
                searchTerm={searchTerm}
                setSearchTerm={(val) => { setSearchTerm(val); setCurrentPage(1); }}
                courseFilter={courseFilter}
                setCourseFilter={(val) => { setCourseFilter(val); setCurrentPage(1); }}
                statusFilter={statusFilter}
                setStatusFilter={(val) => { setStatusFilter(val); setCurrentPage(1); }}
                courses={courseOptions}
            />

            {/* TABLE & PHÂN TRANG */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <CommonTable
                    data={classes}
                    columns={columns}
                    keyExtractor={(item) => item.id}
                    isLoading={isLoading}
                    onRowClick={(cls) => router.push(`/my-classes/${cls.id}`)}
                />

                {!isLoading && classes && classes.length > 0 && (
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
