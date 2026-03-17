import React from 'react';
import TopicDetailClient from '@/features/topics/components/TopicDetailClient';

export default async function TopicDetailPage({ params }: { params: { topicId: string } }) {
    const { topicId } = await params;
    
    return (
        <TopicDetailClient topicId={topicId} />
    );
}
