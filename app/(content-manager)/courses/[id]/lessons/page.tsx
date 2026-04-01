'use client';

import React from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import LessonListClient from '@/features/courses/components/LessonListClient';

export default function LessonListPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const courseId = params?.id as string;
    const importId = searchParams?.get('importId');

    return <LessonListClient courseId={courseId} importId={importId} />;
}