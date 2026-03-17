import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import PageHeader from '@/shared/components/PageHeader';
import StudentGradingClient from '@/features/assignments/components/StudentGradingClient';

export const metadata: Metadata = {
    title: 'Chấm bài | Satori',
    description: 'Chấm bài học viên',
};

export default async function StudentGradingPage({
    params
}: {
    params: Promise<{ id: string, assignmentId: string, studentId: string }>
}) {
    const resolvedParams = await params;

    return (
        <div className="p-8 bg-[#F8F9FA] min-h-screen font-sans w-full flex flex-col">
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

            <StudentGradingClient
                classId={resolvedParams.id}
                assignmentId={resolvedParams.assignmentId}
                studentId={resolvedParams.studentId}
            />
        </div>
    );
}
