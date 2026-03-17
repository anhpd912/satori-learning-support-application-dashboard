'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { AssignmentSummary } from '../types/assignment';
import AssignmentStats from './AssignmentStats';
import AssignmentFilters from './AssignmentFilters';
import CommonTable, { Column } from '@/shared/components/CommonTable';
import Pagination from '@/shared/components/Pagination';
import { useClassAssignments, useDeleteAssignment } from '../hooks/useAssignments';
import { classService } from '@/shared/services/class.service';
import { useQuery } from '@tanstack/react-query';
import Toast, { ToastType } from '@/shared/components/Toast';
import { assignmentService } from '../services/assignment.service';

const formatDate = (dateStr: string) => {
    if (!dateStr) return '---';
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day} Thg ${month}, ${year}`;
};

const mapAssignmentType = (type: string) => {
    switch (type) {
        case 'QUIZ': return 'Quiz';
        case 'WRITING': return 'Viết';
        case 'TRANSLATION': return 'Dịch';
        default: return type;
    }
};

const mapAssignmentStatus = (status: string) => {
    switch (status) {
        case 'DRAFT': return 'Bản nháp';
        case 'PUBLISHED': return 'Đang mở';
        case 'CLOSED': return 'Đã đóng';
        default: return status;
    }
};

export default function AssignmentListClient({ classId }: { classId: string }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('Tất cả');
    const [statusFilter, setStatusFilter] = useState('Tất cả');
    const [currentPage, setCurrentPage] = useState(1);
    const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

    const ITEMS_PER_PAGE = 10;

    const { data, isLoading, refetch } = useClassAssignments(
        classId, 
        currentPage, 
        ITEMS_PER_PAGE,
        {
            title: searchTerm || undefined,
            type: typeFilter === 'Tất cả' ? undefined : typeFilter,
            status: statusFilter === 'Tất cả' ? undefined : statusFilter
        }
    );
    const deleteMutation = useDeleteAssignment();

    // Fetch class details to get memberCount
    const { data: classDetail } = useQuery({
        queryKey: ['class', classId],
        queryFn: () => classService.getClassById(classId),
        enabled: !!classId
    });

    // Fetch all assignments for stats (we might want a dedicated stats endpoint later)
    const { data: allAssignmentsData } = useQuery({
        queryKey: ['assignments', 'class', classId, 'all-stats'],
        queryFn: () => assignmentService.getClassAssignments(classId, 1, 1000), 
        enabled: !!classId
    });

    const assignments = data?.content || [];
    const totalElements = data?.totalElements || 0;
    const totalPages = data?.totalPages || 1;

    const allAssignments = allAssignmentsData?.content || [];
    const memberCount = classDetail?.memberCount || 0;

    const stats = useMemo(() => {
        if (!allAssignments.length) return {
            averageScore: 0,
            completionRate: 0,
            totalSubmissions: 0,
            totalPossibleSubmissions: 0,
            pendingGradingCount: 0,
            expiringSoonCount: 0
        };

        const now = new Date();
        const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

        let totalSubmissions = 0;
        let pendingGradingCount = 0;
        let expiringSoonCount = 0;
        
        allAssignments.forEach(a => {
            totalSubmissions += (a.submissionCount || 0);
            if (a.assignmentType !== 'QUIZ' && a.submissionCount > 0) {
                pendingGradingCount += a.submissionCount;
            }
            if (a.dueDate) {
                const dueDate = new Date(a.dueDate);
                if (dueDate > now && dueDate < tomorrow) {
                    expiringSoonCount++;
                }
            }
        });

        const totalPossibleSubmissions = allAssignments.length * memberCount;
        const completionRate = totalPossibleSubmissions > 0 ? (totalSubmissions / totalPossibleSubmissions) * 100 : 0;

        return {
            averageScore: 0,
            completionRate,
            totalSubmissions,
            totalPossibleSubmissions,
            pendingGradingCount,
            expiringSoonCount
        };
    }, [allAssignments, memberCount]);


    const handleDelete = async (id: string) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa bài tập này? (Chỉ có thể xóa bản nháp)')) {
            try {
                await deleteMutation.mutateAsync(id);
                setToast({ message: 'Đã xóa bài tập thành công', type: 'success' });
                refetch();
            } catch (error: any) {
                setToast({ message: error.message || 'Xóa thất bại', type: 'error' });
            }
        }
    };

    const columns = useMemo<Column<AssignmentSummary>[]>(() => [
        {
            header: 'Tên bài tập',
            render: (a) => (
                <div>
                    <h4 className="font-bold text-gray-900 text-sm">{a.title}</h4>
                    <p className="text-gray-400 text-[11px] mt-0.5 font-medium">
                        {a.questionCount || 0} câu hỏi
                    </p>
                </div>
            )
        },
        {
            header: 'Loại bài tập',
            render: (a) => {
                let bg = 'bg-gray-100 text-gray-600';
                if (a.assignmentType === 'QUIZ') bg = 'bg-purple-100 text-purple-600';
                if (a.assignmentType === 'WRITING') bg = 'bg-orange-100 text-orange-600';
                if (a.assignmentType === 'TRANSLATION') bg = 'bg-teal-100 text-teal-600';

                return (
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${bg}`}>
                        {mapAssignmentType(a.assignmentType)}
                    </span>
                );
            }
        },
        {
            header: 'Hạn nộp',
            render: (a) => <span className="text-gray-600 text-sm font-medium">{formatDate(a.dueDate)}</span>
        },
        {
            header: 'Hoàn thành',
            render: (a) => {
                // Since summary doesn't have total student count, we'll just show the submission count
                // or assume a default if we want a bar. For now, let's just show the number.
                return (
                    <div className="flex flex-col gap-1.5 min-w-[100px]">
                        <div className="flex items-center gap-2">
                            <div className="bg-blue-50 text-blue-600 p-1.5 rounded-lg">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><polyline points="16 11 18 13 22 9"></polyline></svg>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-bold text-gray-900">{a.submissionCount}</span>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight leading-none">Bài đã nộp</span>
                            </div>
                        </div>
                    </div>
                );
            }
        },
        {
            header: 'Trạng thái',
            render: (a) => {
                const isPublished = a.status === 'PUBLISHED';
                const isDraft = a.status === 'DRAFT';
                let colors = 'bg-gray-100 text-gray-500';
                let dot = 'bg-gray-400';

                if (isPublished) {
                    colors = 'bg-green-50 text-green-700';
                    dot = 'bg-green-500';
                } else if (isDraft) {
                    colors = 'bg-blue-50 text-blue-700';
                    dot = 'bg-blue-500';
                }

                return (
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${colors}`}>
                        {mapAssignmentStatus(a.status)}
                        <span className={`w-1.5 h-1.5 rounded-full ${dot}`}></span>
                    </span>
                );
            }
        },
        {
            header: 'Hành động',
            className: 'text-right',
            render: (a) => (
                <div className="flex items-center justify-end gap-3">
                    <Link href={`/my-classes/${classId}/assignments/${a.id}`} className="text-blue-500 hover:text-blue-700" title="Xem chi tiết">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                    </Link>
                    <Link href={`/my-classes/${classId}/assignments/${a.id}/edit`} className="text-gray-400 hover:text-gray-600" title="Chỉnh sửa">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                    </Link>
                    <button 
                        onClick={() => handleDelete(a.id)}
                        className="text-red-400 hover:text-red-600 disabled:opacity-30" 
                        title="Xóa"
                        disabled={a.status !== 'DRAFT'}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                </div>
            )
        }
    ], [classId]);

    return (
        <div>
            {toast && <Toast message={toast.message} type={toast.type} isVisible={!!toast} onClose={() => setToast(null)} />}
            
            <AssignmentStats {...stats} />

            <AssignmentFilters
                searchTerm={searchTerm} setSearchTerm={setSearchTerm}
                typeFilter={typeFilter} setTypeFilter={setTypeFilter}
                statusFilter={statusFilter} setStatusFilter={setStatusFilter}
            />

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
                <CommonTable
                    data={assignments}
                    columns={columns}
                    keyExtractor={(item) => item.id}
                    isLoading={isLoading}
                />
                <div className="p-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500 bg-white">
                    <span className="font-medium">
                        Hiển thị {assignments.length > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0}-{Math.min(currentPage * ITEMS_PER_PAGE, totalElements)} của {totalElements} bài tập
                    </span>
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        totalItems={totalElements}
                        itemsPerPage={ITEMS_PER_PAGE}
                    />
                </div>
            </div>
        </div>
    );
}
