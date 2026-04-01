import { useQuery } from '@tanstack/react-query';
import { userService } from '@/features/users/services/user.service';

export const userKeys = {
    all: ['users'] as const,
    lists: () => [...userKeys.all, 'list'] as const,
    list: (filters: any) => [...userKeys.lists(), filters] as const,
};

export const useUsers = (
    page: number,
    limit: number,
    search: string,
    role: string,
    status: string
) => {
    return useQuery({
        queryKey: userKeys.list({ page, limit, search, role, status }),
        queryFn: () => userService.getUsers(page, limit, search, role, status),
        placeholderData: (previousData) => previousData,
    });
};
