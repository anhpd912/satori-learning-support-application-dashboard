import { useState, useEffect, useCallback } from 'react';
import { courseService, Course } from '@/features/courses/services/course.service';
import { ToastType } from '@/shared/components/Toast';

export const ITEMS_PER_PAGE = 10;

export function useCourseList() {
    const [searchTerm, setSearchTerm] = useState('');
    const [levelFilter, setLevelFilter] = useState('Tất cả');
    const [statusFilter, setStatusFilter] = useState('Tất cả');
    const [currentPage, setCurrentPage] = useState(1);

    const [courses, setCourses] = useState<Course[]>([]);
    const [totalItems, setTotalItems] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    const [deleteCourseId, setDeleteCourseId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: ToastType; isVisible: boolean }>({
        message: '', type: 'success', isVisible: false
    });

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await courseService.getCourses(
                currentPage,
                ITEMS_PER_PAGE,
                searchTerm,
                levelFilter,
                statusFilter
            );

            setCourses(response.data);
            setTotalItems(response.total);
        } catch (error) {
            setToast({ message: 'Lỗi tải dữ liệu khóa học', type: 'error', isVisible: true });
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, searchTerm, levelFilter, statusFilter]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const confirmDelete = async () => {
        if (!deleteCourseId) return;
        setIsDeleting(true);
        try {
            await courseService.deleteCourse(deleteCourseId);
            setToast({ message: 'Xóa khóa học thành công', type: 'success', isVisible: true });
            setDeleteCourseId(null);
            fetchData();
        } catch (err: any) {
            setToast({ message: err.message || 'Lỗi khi xóa khóa học', type: 'error', isVisible: true });
        } finally {
            setIsDeleting(false);
        }
    };

    return {
        searchTerm, setSearchTerm,
        levelFilter, setLevelFilter,
        statusFilter, setStatusFilter,
        currentPage, setCurrentPage,
        courses,
        totalItems,
        isLoading,
        deleteCourseId, setDeleteCourseId,
        isDeleting,
        toast, setToast,
        fetchData,
        confirmDelete
    };
}
