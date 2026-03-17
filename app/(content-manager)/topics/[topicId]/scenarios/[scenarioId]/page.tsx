import React from 'react';
import ScenarioDetailClient from '@/features/topics/components/ScenarioDetailClient';

export default async function ScenarioDetailPage({ 
    params 
}: { 
    params: { topicId: string; scenarioId: string } 
}) {
    const { topicId, scenarioId } = await params;
    
    return (
        <ScenarioDetailClient topicId={topicId} scenarioId={scenarioId} />
    );
}
