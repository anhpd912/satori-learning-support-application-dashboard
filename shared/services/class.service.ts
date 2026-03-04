import axios, { AxiosError } from 'axios';
import {
    ClassBackendDTO,
    ClassModel,
    CreateClassPayload,
    UpdateClassPayload,
    ClassResponse,
    ClassMemberResponse,
    UserResponse,
    PageResponse,
    ApiResponse
} from '@/shared/types/class';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1') + '/classes';

export const classService = {
    getClasses: async (
        page: number,
        limit: number,
        search: string,
        status: string,
        courseId: string,
        teacherId: string
    ) => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : '';

        // 1. Map status ('Active'/'Inactive') sang boolean cho backend
        let isActive: boolean | undefined;
        if (status === 'Active') isActive = true;
        else if (status === 'Inactive') isActive = false;

        try {
            const response = await axios.get<ApiResponse<PageResponse<ClassBackendDTO>>>(API_URL, {
                params: {
                    page: page > 0 ? page - 1 : 0, // Backend dùng 0-based index
                    size: limit,
                    keyword: search || '',
                    isActive: isActive,
                    // Lưu ý: Backend yêu cầu UUID. Nếu filter gửi lên tên (string), API sẽ lỗi 400.
                    // Cần đảm bảo dropdown filter cung cấp ID thay vì Name.
                    courseId: (courseId && courseId !== 'Tất cả') ? courseId : undefined,
                    teacherId: (teacherId && teacherId !== 'Tất cả') ? teacherId : undefined,
                },
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.data.success) {
                throw new Error(response.data.message || 'Lỗi tải danh sách lớp học');
            }

            const pageData = response.data.data;

            // 2. Map dữ liệu từ Backend DTO sang Frontend Model
            const mappedClasses: ClassModel[] = pageData.content.map(item => ({
                id: item.id,
                name: item.name,
                course: item.courseName,
                teacherName: item.teacherName,
                studentCount: item.memberCount,
                status: item.isActive ? 'Active' : 'Inactive'
            }));

            return {
                data: mappedClasses,
                total: pageData.totalElements,
                totalPages: pageData.totalPages
            };

        } catch (error) {
             const err = error as AxiosError<ApiResponse<any>>;
             throw new Error(err.response?.data?.message || err.message || 'Lỗi kết nối Server');
        }
    },

    deleteClass: async (id: string) => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : '';
        try {
            const response = await axios.delete(`${API_URL}/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.data.success) throw new Error(response.data.message);
        } catch (error) {
            const err = error as AxiosError<ApiResponse<any>>;
            throw new Error(err.response?.data?.message || err.message || 'Lỗi khi xóa lớp học');
        }
    },

    createClass: async (payload: CreateClassPayload) => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : '';

        // Xử lý payload: Chuyển chuỗi rỗng/NaN thành undefined để không gửi lên backend (tránh lỗi 400 Bad Request với Date/Integer)
        const cleanPayload = {
            ...payload,
            maxStudents: payload.maxStudents || undefined,
            startDate: payload.startDate || undefined,
            endDate: payload.endDate || undefined,
            description: payload.description || undefined
        };

        try {
            const response = await axios.post<ApiResponse<any>>(API_URL, cleanPayload, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.data.success) throw new Error(response.data.message);
            return response.data.data;
        } catch (error) {
            const err = error as AxiosError<ApiResponse<any>>;
            throw new Error(err.response?.data?.message || err.message || 'Lỗi khi tạo lớp học');
        }
    },

    getClassById: async (classId: string): Promise<ClassResponse> => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : '';

        try {
            const response = await axios.get<ApiResponse<ClassResponse>>(`${API_URL}/${classId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.data.success) {
                throw new Error(response.data.message || 'Không thể tải thông tin chi tiết lớp học');
            }

            return response.data.data;
        } catch (error) {
            const err = error as AxiosError<ApiResponse<any>>;
            throw new Error(err.response?.data?.message || err.message || 'Lỗi kết nối Server');
        }
    },

    getClassMembers: async (classId: string, page: number, limit: number) => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : '';

        try {
            const response = await axios.get<ApiResponse<PageResponse<ClassMemberResponse>>>(`${API_URL}/${classId}/members`, {
                params: {
                    page: page > 0 ? page - 1 : 0,
                    size: limit
                },
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.data.success) {
                throw new Error(response.data.message || 'Không thể tải danh sách học viên');
            }

            return response.data.data;
        } catch (error) {
            const err = error as AxiosError<ApiResponse<any>>;
            throw new Error(err.response?.data?.message || err.message || 'Lỗi kết nối Server');
        }
    },

    getEligibleLearners: async (classId: string, page: number, limit: number, keyword: string) => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : '';

        try {
            const response = await axios.get<ApiResponse<PageResponse<UserResponse>>>(`${API_URL}/${classId}/eligible-learners`, {
                params: {
                    page: page > 0 ? page - 1 : 0,
                    size: limit,
                    keyword: keyword || ''
                },
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.data.success) {
                throw new Error(response.data.message || 'Không thể tải danh sách học viên');
            }

            return response.data.data;
        } catch (error) {
            const err = error as AxiosError<ApiResponse<any>>;
            throw new Error(err.response?.data?.message || err.message || 'Lỗi kết nối Server');
        }
    },

    addMember: async (classId: string, userId: string) => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : '';

        try {
            const response = await axios.post<ApiResponse<ClassMemberResponse>>(`${API_URL}/${classId}/members`, { userId }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.data.success) throw new Error(response.data.message);
            return response.data;
        } catch (error) {
            const err = error as AxiosError<ApiResponse<any>>;
            throw new Error(err.response?.data?.message || err.message || 'Lỗi khi thêm học viên vào lớp');
        }
    },

    removeMember: async (classId: string, userId: string) => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : '';

        try {
            const response = await axios.delete<ApiResponse<void>>(`${API_URL}/${classId}/members/${userId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.data.success) throw new Error(response.data.message);
            return response.data;
        } catch (error) {
            const err = error as AxiosError<ApiResponse<any>>;
            throw new Error(err.response?.data?.message || err.message || 'Lỗi khi xóa học viên khỏi lớp');
        }
    },

    updateClass: async (id: string, payload: UpdateClassPayload) => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : '';

        try {
            // Backend trả về ApiResponse<ClassResponse>
            const response = await axios.put<ApiResponse<ClassResponse>>(`${API_URL}/${id}`, payload, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.data.success) throw new Error(response.data.message);
            return response.data.data;
        } catch (error) {
            const err = error as AxiosError<ApiResponse<any>>;
            throw new Error(err.response?.data?.message || err.message || 'Lỗi khi cập nhật lớp học');
        }
    }
};

// Export types for convenience
export type { ClassBackendDTO, ClassModel, CreateClassPayload, UpdateClassPayload, ClassResponse, ClassMemberResponse, UserResponse, PageResponse, ApiResponse };
