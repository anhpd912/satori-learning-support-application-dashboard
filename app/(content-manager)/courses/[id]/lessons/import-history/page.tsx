'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import ImportHistoryClient from '@/features/curriculum-import/components/ImportHistoryClient';

export default function ImportHistoryPage() {
    const params = useParams();
    const courseId = params?.id as string;

    return <ImportHistoryClient courseId={courseId} />;
}
