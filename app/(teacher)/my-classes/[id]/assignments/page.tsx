import React from 'react';
import Link from 'next/link';
import PageHeader from '@/shared/components/PageHeader';
import AssignmentListClient from '@/features/assignments/components/AssignmentListClient';

export default async function AssignmentsPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;
    
    return (
        <div className="p-8 bg-gray-50 min-h-screen font-sans w-full">
            
            <PageHeader 
                breadcrumb={[
                    { label: 'Lớp học của tôi', href: '/my-classes' },
                    { label: 'UD102', href: `/my-classes/${resolvedParams.id}` },
                    { label: 'Quản lí bài tập', active: true }
                ]}
                backUrl={`/my-classes/${resolvedParams.id}`}
                title="Quản lý bài tập"
                action={
                    <Link 
                        href={`/my-classes/${resolvedParams.id}/assignments/create`}
                        className="flex items-center gap-2 bg-[#253A8C] hover:bg-[#1e2e70] text-white font-bold py-2.5 px-5 rounded-xl shadow-sm transition-all text-sm"
                    >
                        Giao bài tập mới
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                    </Link>
                }
            />

            <AssignmentListClient classId={resolvedParams.id} />
        </div>
    );
}
