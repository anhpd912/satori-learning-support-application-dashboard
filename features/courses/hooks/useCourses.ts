import { useQuery } from '@tanstack/react-query';
import { courseService } from '@/features/courses/services/course.service';

export const courseKeys = {
    all: ['courses'] as const,
    lists: () => [...courseKeys.all, 'list'] as const,
    list: (filters: any) => [...courseKeys.lists(), filters] as const,
};

export const useCourses = (
    page: number,
    limit: number,
    search: string,
    visibility: string,
    status: string
) => {
    return useQuery({
        queryKey: courseKeys.list({ page, limit, search, visibility, status }),
        queryFn: () => courseService.getCourses(page, limit, search, visibility, status),
        placeholderData: (previousData) => previousData,
    });
};
