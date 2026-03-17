import React from 'react';
import CreateScenarioClient from '@/features/topics/components/CreateScenarioClient';

export default async function CreateScenarioPage({
    params,
}: {
    params: Promise<{ topicId: string }>;
}) {
    const { topicId } = await params;

    return (
        <div className="bg-gray-50 min-h-screen font-sans w-full flex flex-col">
            <div className="p-8 pb-32 max-w-7xl mx-auto w-full flex-1">
                <CreateScenarioClient topicId={topicId} />
            </div>
        </div>
    );
}
