'use client';

import React from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import LessonDetailClient from '@/features/courses/components/LessonDetailClient';

export default function LessonDetailPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const courseId = params?.id as string;
    const lessonId = params?.lessonId as string;
    const importId = searchParams?.get('importId');

    return <LessonDetailClient courseId={courseId} lessonId={lessonId} importId={importId} />;
}