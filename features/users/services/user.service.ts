import { User } from '@/shared/types/user';
import api from '@/lib/axios';
import { AxiosError } from 'axios';

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
    role: 'LEARNER' | 'TEACHER' | 'CONTENT_MANAGER' | 'OPERATION_MANAGER' | 'ADMIN';
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

interface ServiceError extends Error {
    code?: string;
    data?: any;
    validationErrors?: any;
}

const USERS_PATH = '/users';

export const userService = {
    getUsers: async (
        page: number, 
        limit: number, 
        search: string, 
        role: string, 
        status: string
    ): Promise<GetUsersResponse> => {
        const pageIndex = page > 0 ? page - 1 : 0;

        try {
            const response = await api.get<BackendApiResponse>(USERS_PATH, {
                params: {
                    page: pageIndex,
                    size: limit,
                    ...(search ? { keyword: search } : {}),
                    ...(role && role !== 'Tất cả' ? { role: role.toUpperCase() } : {}),
                    ...(status && status !== 'Tất cả' ? { status: status.toUpperCase() } : {}),
                }
            });

            const apiResponse = response.data;

            if (!apiResponse.success) {
                throw new Error(apiResponse.message || 'Không thể tải danh sách người dùng');
            }

            const mappedUsers: User[] = apiResponse.data.content.map((u) => {
                const displayName = u.displayName || u.fullName || `${u.firstName} ${u.lastName}`;

                return {
                    id: u.id,
                    name: displayName,
                    email: u.email,
                    displayName: u.displayName || displayName,
                    role: u.role as User['role'], 
                    status: u.status as User['status'], 
                    avatarUrl: u.avatarUrl 
                        ? u.avatarUrl 
                        : `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random&color=fff`,
                    
                    phoneNumber: u.phoneNumber || '',
                    dateOfBirth: u.dateOfBirth || '',
                    createdAt: u.createdAt || new Date().toISOString()
                };
            });

            return {
                data: mappedUsers,
                total: apiResponse.data.totalElements,
                totalPages: apiResponse.data.totalPages
            };

        } catch (error) {
            const err = error as AxiosError<BackendApiResponse>;
            throw new Error(err.response?.data?.message || err.message || 'Lỗi kết nối Server');
        }
    },

    createUser: async (userData: CreateUserRequest) => {
        try {
            const response = await api.post(USERS_PATH, userData);
            return response.data;
        } catch (error) {
            const err = error as AxiosError<BackendApiResponse>;
            if (err.response?.data) {
                const responseData = err.response.data;
                const customError: ServiceError = new Error(responseData.message || 'Tạo người dùng thất bại');

                if (responseData.code === 'DELETED_USER_EXISTS' && responseData.data) {
                    customError.code = 'DELETED_USER_EXISTS';
                    customError.data = responseData.data;
                } else if (responseData.code === 'VALIDATION_ERROR' && responseData.data) {
                    customError.validationErrors = responseData.data;
                } else if (responseData.code === 'EMAIL_EXISTS') {
                    customError.validationErrors = { email: responseData.message };
                }
                throw customError;
            }
            throw error;
        }
    },

    getUserById: async (id: string): Promise<User> => {
        try {
            const response = await api.get(`${USERS_PATH}/${id}/details`);
            const apiResponse = response.data;

            if (!apiResponse.success) {
                throw new Error(apiResponse.message || 'Không thể tải thông tin người dùng');
            }

            const rootData = apiResponse.data;
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
        } catch (error) {
            const err = error as AxiosError<BackendApiResponse>;
            throw new Error(err.response?.data?.message || err.message || 'Lỗi kết nối Server');
        }
    },

    updateUser: async (id: string, userData: UpdateUserRequest): Promise<void> => {
        try {
            await api.put(`${USERS_PATH}/${id}`, userData);
        } catch (error) {
            const err = error as AxiosError<BackendApiResponse>;
            if (err.response?.data) {
                const responseData = err.response.data;
                const customError: ServiceError = new Error(responseData.message || 'Cập nhật thất bại');
                
                if (responseData.code === 'VALIDATION_ERROR' && responseData.data) {
                    customError.validationErrors = responseData.data;
                } else if (responseData.code === 'EMAIL_EXISTS') {
                    customError.validationErrors = { email: responseData.message };
                }
                throw customError;
            }
            throw error;
        }
    },

    deleteUser: async (id: string): Promise<void> => {
        try {
            await api.delete(`${USERS_PATH}/${id}`);
        } catch (error) {
            const err = error as AxiosError<BackendApiResponse>;
            throw new Error(err.response?.data?.message || err.message || 'Lỗi kết nối Server');
        }
    },

    restoreUser: async (payload: RestoreUserRequest): Promise<void> => {
        try {
            const response = await api.post(`${USERS_PATH}/restore`, payload);

            if (!response.data.success) {
                throw new Error(response.data.message || 'Khôi phục tài khoản thất bại');
            }
        } catch (error) {
            const err = error as AxiosError<BackendApiResponse>;
            throw new Error(err.response?.data?.message || err.message || 'Lỗi kết nối Server');
        }
    },

    getImportTemplate: async (): Promise<void> => {
        try {
            const response = await api.get(`${USERS_PATH}/import/template`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'user_import_template.xlsx');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error: any) {
            console.error("Download error:", error);
            throw new Error(error.response?.data?.message || 'Không thể tải tệp mẫu');
        }
    },

    previewUserImport: async (file: File): Promise<any> => {
        const formData = new FormData();
        formData.append('file', file);
        try {
            const response = await api.post(`${USERS_PATH}/import`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            // Backend returns ApiResponse<ImportUsersResult>
            if (!response.data.success) throw new Error(response.data.message);
            return response.data.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Lỗi xử lý file import');
        }
    },

    confirmUserImport: async (importData: any): Promise<void> => {
        try {
            const response = await api.post(`${USERS_PATH}/import/approve`, importData);
            if (!response.data.success) throw new Error(response.data.message);
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Lỗi xác nhận import');
        }
    }
};