import { AxiosError } from 'axios';
import api from '@/lib/axios';

/**
 * Phản hồi từ API sau khi yêu cầu nhập liệu được chấp nhận.
 */
export interface CurriculumImportResponse {
    importId: string;
    fileName: string;
    status: string;
    // Có thể có các trường khác...
}

interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

export const lessonImportService = {
    /**
     * Gửi file PDF lên backend để AI phân tích và bóc tách.
     * @param file File PDF cần xử lý.
     * @param courseId ID của khóa học liên quan.
     * @returns Dữ liệu phản hồi từ API.
     */
    importByAI: async (file: File, courseId: string): Promise<CurriculumImportResponse> => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('courseId', courseId);

        try {
            const response = await api.post<ApiResponse<CurriculumImportResponse>>('/manager/curriculum-imports', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });
            if (!response.data.success) throw new Error(response.data.message);
            return response.data.data;
        } catch (error) {
            const err = error as AxiosError<ApiResponse<any>>;
            throw new Error(err.response?.data?.message || err.message || 'Lỗi khi tải tệp lên');
        }
    },
};
