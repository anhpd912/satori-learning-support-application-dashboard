import React from 'react';
import Link from 'next/link';
import PageHeader from '@/shared/components/PageHeader';
import AssignmentDetailClient from '@/features/assignments/components/AssignmentDetailClient';

export default async function AssignmentDetailPage({ params }: { params: Promise<{ id: string, assignmentId: string }> }) {
    const resolvedParams = await params;

    return (
        <div className="p-8 bg-[#F8F9FA] min-h-screen font-sans w-full">
            <PageHeader
                breadcrumb={[
                    { label: 'Lớp học của tôi', href: '/my-classes' },
                    { label: 'UD102', href: `/my-classes/${resolvedParams.id}` },
                    { label: 'Quản lí bài tập', href: `/my-classes/${resolvedParams.id}/assignments` },
                    { label: 'Chi tiết bài tập', active: true }
                ]}
                backUrl={`/my-classes/${resolvedParams.id}/assignments`}
                title="Chi tiết bài tập"
            />

            <AssignmentDetailClient classId={resolvedParams.id} assignmentId={resolvedParams.assignmentId} />
        </div>
    );
}
