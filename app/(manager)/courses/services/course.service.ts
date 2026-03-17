import api from '@/lib/axios';

export interface Course {
    id: string;
    name: string;
    jlptLevel: string; 
    lessonCount: number;
    status: 'ACTIVE' | 'INACTIVE';
    thumbnailUrl: string;
    orderIndex?: number;
}

export interface PageResponse<T> {
    content: T[];
    pageNumber: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
}

export interface ApiResponse<T> {
    success: boolean;
    code: string;
    message: string;
    data: T;
}

export interface CreateCoursePayload {
    name: string;
    description?: string;
    jlptLevel: string; 
    thumbnailUrl?: string;
    orderIndex?: number;
}

export interface CourseDetail {
    id: string;
    name: string;
    description: string | null;
    jlptLevel: string;
    thumbnailUrl: string | null;
    orderIndex: number;
    status: 'ACTIVE' | 'INACTIVE';
    createdBy: string;
    updatedBy: string;
    createdAt: string;
    updatedAt: string;
    lessonCount: number;
    studentCount: number;
}

export interface UpdateCoursePayload {
    name?: string;
    description?: string;
    thumbnailUrl?: string;
    orderIndex?: number;
    jlptLevel?: string; 
    status?: string;
}

class CourseService {
    private readonly API_URL = process.env.NEXT_PUBLIC_API_URL + '/manager/courses'; 

    async getCourses(
        page: number = 1,
        size: number = 10,
        keyword?: string,
        levelFilter?: string,
        statusFilter?: string
    ) {
        try {
            const backendPage = page > 0 ? page - 1 : 0;

            const params = new URLSearchParams();
            params.append('page', backendPage.toString());
            params.append('size', size.toString());

            if (keyword && keyword.trim() !== '') {
                params.append('keyword', keyword.trim());
            }

            if (levelFilter && levelFilter !== 'Tất cả' && levelFilter !== 'ALL') {
                params.append('level', levelFilter);
            }

            const mappedStatus = this.mapStatusToEnum(statusFilter);
            if (mappedStatus) {
                params.append('status', mappedStatus);
            }

            const response = await api.get<ApiResponse<PageResponse<Course>>>(this.API_URL, { 
                params: params
            });

            const responseData = response.data.data;

            return {
                data: responseData.content,
                total: responseData.totalElements,
                totalPages: responseData.totalPages
            };

        } catch (error) {
            console.error("Lỗi khi fetch courses:", error);
            throw error;
        }
    }

    private mapStatusToEnum(status?: string): string | null {
        if (!status || status === 'Tất cả' || status === 'ALL') return null;

        // Chuẩn hóa giá trị đầu vào về dạng chữ hoa (UPPERCASE)
        const normalizedStatus = status.toUpperCase();

        // Chỉ chấp nhận các trạng thái ACTIVE và INACTIVE
        if (normalizedStatus === 'ACTIVE' || normalizedStatus === 'INACTIVE') {
            return normalizedStatus;
        }

        // Trả về null cho các trạng thái khác (bao gồm cả 'DELETED' nếu có) để không gửi lên backend
        return null;
    }

    async createCourse(payload: CreateCoursePayload, thumbnailFile?: File) {
        const formData = new FormData();
        
        const requestPart = {
            name: payload.name,
            description: payload.description,
            jlptLevel: payload.jlptLevel,
            orderIndex: payload.orderIndex,
            thumbnailUrl: payload.thumbnailUrl
        };

        formData.append('request', new Blob([JSON.stringify(requestPart)], { type: 'application/json' }));

        if (thumbnailFile) {
            formData.append('thumbnail', thumbnailFile);
        }

        try {
            const response = await api.post(this.API_URL, formData);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi tạo khóa học:", error);
            throw error;
        }
    }

    async getCourseById(id: string): Promise<CourseDetail> {
        try {
            const response = await api.get<ApiResponse<CourseDetail>>(`${this.API_URL}/${id}`);

            if (!response.data.success) {
                throw new Error(response.data.message || 'Không thể tải thông tin khóa học');
            }

            return response.data.data;
        } catch (error: any) {
            if (error.response?.data?.message) {
                throw new Error(error.response.data.message);
            }
            throw new Error(error.message || 'Lỗi kết nối Server');
        }
    }

    async updateCourse(id: string, payload: UpdateCoursePayload, thumbnailFile?: File): Promise<void> {

        const formData = new FormData();
        
        const requestPart = {
            name: payload.name,
            description: payload.description,
            jlptLevel: payload.jlptLevel,
            orderIndex: payload.orderIndex,
            status: payload.status,
            thumbnailUrl: payload.thumbnailUrl
        };

        formData.append('request', new Blob([JSON.stringify(requestPart)], { type: 'application/json' }));

        if (thumbnailFile) {
            formData.append('thumbnail', thumbnailFile);
        }

        try {
            await api.put(`${this.API_URL}/${id}`, formData);
        } catch (error: any) {
            if (error.response?.data) {
                const responseData = error.response.data;
                if (responseData.code === 'VALIDATION_ERROR' && responseData.data) {
                    throw { validationErrors: responseData.data };
                }
                throw new Error(responseData.message || 'Cập nhật khóa học thất bại');
            }
            throw error;
        }
    }

    async deleteCourse(id: string): Promise<void> {
        try {
            const response = await api.delete(`${this.API_URL}/${id}`);
            if (!response.data.success) {
                throw new Error(response.data.message || 'Xóa khóa học thất bại');
            }
        } catch (error: any) {
            if (error.response?.data?.message) {
                throw new Error(error.response.data.message);
            }
            throw new Error(error.message || 'Lỗi khi xóa khóa học');
        }
    }
}

export const courseService = new CourseService();
