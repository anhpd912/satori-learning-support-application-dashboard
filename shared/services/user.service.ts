import { User } from '@/shared/types/user';

interface BackendUser {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    displayName: string | null;
    fullName: string | null;
    avatarUrl: string | null;
    phoneNumber: string | null;
    dateOfBirth: string | null;
    role: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    lastLoginAt: string | null;
}

interface BackendApiResponse {
    success: boolean;
    code: string;
    message: string;
    data: {
        content: BackendUser[];
        pageNumber: number;
        pageSize: number;
        totalElements: number;
        totalPages: number;
        last: boolean;
        first: boolean;
    };
    timestamp: string;
}

interface GetUsersResponse {
    data: User[];
    total: number;
    totalPages: number;
}

export interface CreateUserRequest {
    email: string;
    firstName: string;
    lastName: string;
    role: 'LEARNER' | 'TEACHER' | 'MANAGER' | 'ADMIN';
    phoneNumber?: string;
    dateOfBirth?: string;
}

export interface UpdateUserRequest {
    firstName?: string;
    lastName?: string;
    email?: string;
    phoneNumber?: string;
    role?: string;
    dateOfBirth?: string;
    status?: string;
}

export interface RestoreUserRequest {
    userId: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
}

export const userService = {
    getUsers: async (
        page: number, 
        limit: number, 
        search: string, 
        role: string, 
        status: string
    ): Promise<GetUsersResponse> => {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';
        const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : '';

        const pageIndex = page > 0 ? page - 1 : 0;

        let mappedRole = '';
        if (role && role !== 'Tất cả') {
             mappedRole = role.toUpperCase();
        }

        let mappedStatus = '';
        if (status && status !== 'Tất cả') {
            mappedStatus = status.toUpperCase();
        }

        const params = new URLSearchParams({
            page: pageIndex.toString(),
            size: limit.toString(),
            ...(search && { keyword: search }), 
            ...(mappedRole && { role: mappedRole }),   
            ...(mappedStatus && { status: mappedStatus }),
        });

        try {
            const res = await fetch(`${API_URL}/users?${params.toString()}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
            });

            const response: BackendApiResponse = await res.json();

            if (!res.ok || !response.success) {
                throw new Error(response.message || 'Không thể tải danh sách người dùng');
            }

            const mappedUsers: User[] = response.data.content.map((u) => {
                const displayName = u.displayName || u.fullName || `${u.firstName} ${u.lastName}`;

                return {
                    id: u.id,
                    name: displayName,
                    email: u.email,
                    role: u.role as User['role'], 
                    status: u.status as User['status'], 
                    avatarUrl: u.avatarUrl 
                        ? u.avatarUrl 
                        : `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random&color=fff`,
                    
                    phoneNumber: u.phoneNumber || '', 
                };
            });

            return {
                data: mappedUsers,
                total: response.data.totalElements,
                totalPages: response.data.totalPages
            };

        } catch (error: unknown) {
            if (error instanceof Error) {
                throw new Error(error.message);
            }
            throw new Error('Lỗi kết nối Server');
        }
    },

    createUser: async (userData: CreateUserRequest) => {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';
        const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : '';

        try {
            const res = await fetch(`${API_URL}/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(userData),
            });

            const response = await res.json();

            if (!res.ok || !response.success) {
                const error = new Error(response.message || 'Tạo người dùng thất bại');

                if (response.code === 'DELETED_USER_EXISTS' && response.data) {
                    (error as any).code = 'DELETED_USER_EXISTS';
                    (error as any).data = response.data;
                }

                if (response.code === 'VALIDATION_ERROR' && response.data) {
                    (error as any).validationErrors = response.data;
                }

                if (response.code === 'EMAIL_EXISTS') {
                    (error as any).validationErrors = { email: response.message };
                }

                throw error;
            }

            return response;

        } catch (error: any) {
            throw error;
        }
    },

    getUserById: async (id: string): Promise<User> => {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';
        const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : '';

        try {
            const res = await fetch(`${API_URL}/users/${id}/details`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
            });

            const response = await res.json();

            if (!res.ok || !response.success) {
                throw new Error(response.message || 'Không thể tải thông tin người dùng');
            }

            const rootData = response.data;
            const u = rootData.userInfo;
            return {
                id: u.id,
                name: u.fullName,
                displayName: u.displayName,
                email: u.email,
                role: u.role,
                status: u.status,
                avatarUrl: u.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.fullName)}&background=random&color=fff`,
                phoneNumber: u.phoneNumber,
                dateOfBirth: u.dateOfBirth,
                createdAt: u.createdAt,
                stats: {
                    totalCourses: rootData.totalCourses,
                    averageGrade: rootData.averageGrade
                },
                classEnrollments: rootData.classEnrollments || [],
                taughtClasses: rootData.taughtClasses || [] 
            } as any;
        } catch (error: any) {
            throw new Error(error.message || 'Lỗi kết nối Server');
        }
    },

    updateUser: async (id: string, userData: UpdateUserRequest): Promise<void> => {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';
        const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : '';

        try {
            const res = await fetch(`${API_URL}/users/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(userData),
            });

            const response = await res.json();

            if (!res.ok || !response.success) {
                const error = new Error(response.message || 'Cập nhật thất bại');
                
                if (response.code === 'VALIDATION_ERROR' && response.data) {
                    (error as any).validationErrors = response.data;
                }
                if (response.code === 'EMAIL_EXISTS') {
                    (error as any).validationErrors = { email: response.message };
                }

                throw error;
            }

        } catch (error: any) {
            throw error;
        }
    },

    deleteUser: async (id: string): Promise<void> => {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';
        const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : '';

        try {
            const res = await fetch(`${API_URL}/users/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                throw new Error(data.message || 'Xóa người dùng thất bại');
            }

        } catch (error: any) {
            throw new Error(error.message || 'Lỗi kết nối Server');
        }
    },

    restoreUser: async (payload: RestoreUserRequest): Promise<void> => {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';
        const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : '';

        try {
            const res = await fetch(`${API_URL}/users/restore`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload), 
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                throw new Error(data.message || 'Khôi phục tài khoản thất bại');
            }
        } catch (error: any) {
            throw new Error(error.message || 'Lỗi kết nối Server');
        }
    },
};