import React from 'react';
import Link from 'next/link';
import PageHeader from '@/shared/components/PageHeader';
import StudentSubmissionDetailClient from '@/features/assignments/components/StudentSubmissionDetailClient';

export default async function StudentSubmissionDetailPage({
    params
}: {
    params: Promise<{ id: string, assignmentId: string, studentId: string }>
}) {
    const resolvedParams = await params;

    return (
        <div className="p-8 bg-[#F8F9FA] min-h-screen font-sans w-full">
            <PageHeader
                breadcrumb={[
                    { label: 'Lớp học của tôi', href: '/my-classes' },
                    { label: 'UD102', href: `/my-classes/${resolvedParams.id}` },
                    { label: 'Quản lí bài tập', href: `/my-classes/${resolvedParams.id}/assignments` },
                    { label: 'Chi tiết bài tập', href: `/my-classes/${resolvedParams.id}/assignments/${resolvedParams.assignmentId}` },
                    { label: 'Chấm bài', active: true }
                ]}
                backUrl={`/my-classes/${resolvedParams.id}/assignments/${resolvedParams.assignmentId}/results/${resolvedParams.studentId}`}
                title="Chấm bài học viên"
            />

            <StudentSubmissionDetailClient
                classId={resolvedParams.id}
                assignmentId={resolvedParams.assignmentId}
                studentId={resolvedParams.studentId}
            />
        </div>
    );
}
