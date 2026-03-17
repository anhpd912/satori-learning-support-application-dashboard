import React from 'react';
import UpdateScenarioClient from '@/features/topics/components/UpdateScenarioClient';

export default async function UpdateScenarioPage({
    params,
}: {
    params: Promise<{ topicId: string; scenarioId: string }>;
}) {
    const { topicId, scenarioId } = await params;

    return (
        <div className="bg-slate-50/50 min-h-screen font-sans w-full flex flex-col">
            <div className="p-8 pb-40 max-w-7xl mx-auto w-full flex-1">
                <UpdateScenarioClient topicId={topicId} scenarioId={scenarioId} />
            </div>
        </div>
    );
}
