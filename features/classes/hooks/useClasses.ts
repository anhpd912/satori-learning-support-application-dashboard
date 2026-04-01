import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { classService } from '@/features/classes/services/class.service';
import { CreateClassPayload, UpdateClassPayload } from '@/shared/types/class';

// Keys for query invalidation
export const classKeys = {
    all: ['classes'] as const,
    lists: () => [...classKeys.all, 'list'] as const,
    list: (filters: any) => [...classKeys.lists(), filters] as const,
    details: () => [...classKeys.all, 'detail'] as const,
    detail: (id: string) => [...classKeys.details(), id] as const,
};

export const useClasses = (
    page: number,
    limit: number,
    search: string,
    status: string,
    courseId: string,
    teacherId: string
) => {
    return useQuery({
        queryKey: classKeys.list({ page, limit, search, status, courseId, teacherId }),
        queryFn: () => classService.getClasses(page, limit, search, status, courseId, teacherId),
        // Giữ lại data cũ khi chuyển trang giúp UI mượt hơn
        placeholderData: (previousData) => previousData, 
    });
};

export const useClassDetail = (classId: string) => {
    return useQuery({
        queryKey: classKeys.detail(classId),
        queryFn: () => classService.getClassById(classId),
        enabled: !!classId,
    });
};

export const useDeleteClass = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => classService.deleteClass(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: classKeys.lists() });
        },
    });
};

export const useCreateClass = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: CreateClassPayload) => classService.createClass(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: classKeys.lists() });
        },
    });
};

export const useUpdateClass = (id: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: UpdateClassPayload) => classService.updateClass(id, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: classKeys.lists() });
            queryClient.invalidateQueries({ queryKey: classKeys.detail(id) });
        },
    });
};
