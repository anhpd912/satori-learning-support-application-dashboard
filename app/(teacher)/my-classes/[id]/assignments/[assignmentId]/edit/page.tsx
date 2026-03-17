import React from 'react';
import { Metadata } from 'next';
import CreateAssignmentClient from '@/features/assignments/components/CreateAssignmentClient';

export const metadata: Metadata = {
    title: 'Chỉnh sửa bài tập | Satori',
    description: 'Chỉnh sửa nội dung bài tập',
};

export default async function EditAssignmentPage({
    params
}: {
    params: Promise<{ id: string, assignmentId: string }>
}) {
    const resolvedParams = await params;

    return (
        <div className="p-8 bg-[#F8F9FA] min-h-screen font-sans w-full flex flex-col">
            <CreateAssignmentClient 
                classId={resolvedParams.id} 
                assignmentId={resolvedParams.assignmentId} 
            />
        </div>
    );
}
