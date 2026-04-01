import api from '@/lib/axios';
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

export const classService = {
    getClasses: async (
        page: number,
        limit: number,
        search: string,
        status: string,
        courseId: string,
        teacherId: string
    ) => {
        // 1. Map status ('Active'/'Inactive') sang boolean cho backend
        let isActive: boolean | undefined;
        if (status === 'Active') isActive = true;
        else if (status === 'Inactive') isActive = false;

        try {
            const response = await api.get<ApiResponse<PageResponse<ClassBackendDTO>>>('/classes', {
                params: {
                    page: page > 0 ? page - 1 : 0, // Backend dùng 0-based index
                    size: limit,
                    keyword: search || '',
                    isActive: isActive,
                    // Lưu ý: Backend yêu cầu UUID. Nếu filter gửi lên tên (string), API sẽ lỗi 400.
                    // Cần đảm bảo dropdown filter cung cấp ID thay vì Name.
                    courseId: (courseId && courseId !== 'Tất cả') ? courseId : undefined,
                    teacherId: (teacherId && teacherId !== 'Tất cả') ? teacherId : undefined,
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
                maxStudents: item.maxStudents ?? null,
                status: item.isActive ? 'Active' : 'Inactive'
            }));

            return {
                data: mappedClasses,
                total: pageData.totalElements,
                totalPages: pageData.totalPages
            };

        } catch (error: any) {
             throw new Error(error.response?.data?.message || error.message || 'Lỗi kết nối Server');
        }
    },

    deleteClass: async (id: string) => {
        try {
            const response = await api.delete(`/classes/${id}`);
            if (!response.data.success) throw new Error(response.data.message);
        } catch (error: any) {
            throw new Error(error.response?.data?.message || error.message || 'Lỗi khi xóa lớp học');
        }
    },

    createClass: async (payload: CreateClassPayload) => {
        // Xử lý payload: Chuyển chuỗi rỗng/NaN thành undefined để không gửi lên backend (tránh lỗi 400 Bad Request với Date/Integer)
        const cleanPayload = {
            ...payload,
            maxStudents: payload.maxStudents || undefined,
            startDate: payload.startDate || undefined,
            endDate: payload.endDate || undefined,
            description: payload.description || undefined
        };

        try {
            const response = await api.post<ApiResponse<any>>('/classes', cleanPayload);
            if (!response.data.success) throw new Error(response.data.message);
            return response.data.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || error.message || 'Lỗi khi tạo lớp học');
        }
    },

    getClassById: async (classId: string): Promise<ClassResponse> => {
        try {
            const response = await api.get<ApiResponse<ClassResponse>>(`/classes/${classId}`);

            if (!response.data.success) {
                throw new Error(response.data.message || 'Không thể tải thông tin chi tiết lớp học');
            }

            return response.data.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || error.message || 'Lỗi kết nối Server');
        }
    },

    getClassMembers: async (classId: string, page: number, limit: number) => {
        try {
            const response = await api.get<ApiResponse<PageResponse<ClassMemberResponse>>>(`/classes/${classId}/members`, {
                params: {
                    page: page > 0 ? page - 1 : 0,
                    size: limit
                }
            });

            if (!response.data.success) {
                throw new Error(response.data.message || 'Không thể tải danh sách học viên');
            }

            return response.data.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || error.message || 'Lỗi kết nối Server');
        }
    },

    getEligibleLearners: async (classId: string, page: number, limit: number, keyword: string) => {
        try {
            const response = await api.get<ApiResponse<PageResponse<UserResponse>>>(`/classes/${classId}/eligible-learners`, {
                params: {
                    page: page > 0 ? page - 1 : 0,
                    size: limit,
                    keyword: keyword || ''
                }
            });

            if (!response.data.success) {
                throw new Error(response.data.message || 'Không thể tải danh sách học viên');
            }

            return response.data.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || error.message || 'Lỗi kết nối Server');
        }
    },

    addMember: async (classId: string, userId: string) => {
        try {
            const response = await api.post<ApiResponse<ClassMemberResponse>>(`/classes/${classId}/members`, { userId });
            if (!response.data.success) throw new Error(response.data.message);
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || error.message || 'Lỗi khi thêm học viên vào lớp');
        }
    },

    removeMember: async (classId: string, userId: string) => {
        try {
            const response = await api.delete<ApiResponse<void>>(`/classes/${classId}/members/${userId}`);
            if (!response.data.success) throw new Error(response.data.message);
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || error.message || 'Lỗi khi xóa học viên khỏi lớp');
        }
    },

    updateClass: async (id: string, payload: UpdateClassPayload) => {
        try {
            // Backend trả về ApiResponse<ClassResponse>
            const response = await api.put<ApiResponse<ClassResponse>>(`/classes/${id}`, payload);
            if (!response.data.success) throw new Error(response.data.message);
            return response.data.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || error.message || 'Lỗi khi cập nhật lớp học');
        }
    }
};

// Export types for convenience
export type { ClassBackendDTO, ClassModel, CreateClassPayload, UpdateClassPayload, ClassResponse, ClassMemberResponse, UserResponse, PageResponse, ApiResponse };
