import { useState, useEffect } from 'react';
import { CourseDetail, courseService } from '@/features/courses/services/course.service';
import { ToastType } from '@/shared/components/Toast';

export function useCourseDetail(courseId: string) {
    const [course, setCourse] = useState<CourseDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [toast, setToast] = useState<{ message: string; type: ToastType; isVisible: boolean }>({
        message: '', type: 'success', isVisible: false
    });

    useEffect(() => {
        const fetchCourseDetail = async () => {
            if (!courseId) return;
            
            setIsLoading(true);
            try {
                const data = await courseService.getCourseById(courseId);
                setCourse(data);
            } catch (error: any) {
                setToast({ message: error.message || 'Lỗi tải dữ liệu', type: 'error', isVisible: true });
            } finally {
                setIsLoading(false);
            }
        };

        fetchCourseDetail();
    }, [courseId]);

    return {
        course,
        isLoading,
        toast, setToast
    };
}
