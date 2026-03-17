import React from 'react';
import Link from 'next/link';
import PageHeader from '@/shared/components/PageHeader';
import CreateAssignmentClient from '@/features/assignments/components/CreateAssignmentClient';

export default async function CreateAssignmentPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;
    
    return (
        <div className="bg-gray-50 min-h-screen font-sans w-full flex flex-col">
            <div className="p-8 pb-32 w-full flex-1">
                <CreateAssignmentClient classId={resolvedParams.id} />
            </div>
        </div>
    );
}
