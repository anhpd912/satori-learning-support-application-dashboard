'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import ImportAIClient from '@/features/curriculum-import/components/ImportAIClient';

export default function ImportAIPage() {
    const params = useParams();
    const courseId = params?.id as string;

    return <ImportAIClient courseId={courseId} />;
}