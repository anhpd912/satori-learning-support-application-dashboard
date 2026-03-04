import axios, { AxiosError } from 'axios';

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

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1') + '/manager/curriculum-imports';

export const lessonImportService = {
    /**
     * Gửi file PDF lên backend để AI phân tích và bóc tách.
     * @param file File PDF cần xử lý.
     * @param courseId ID của khóa học liên quan.
     * @returns Dữ liệu phản hồi từ API.
     */
    importByAI: async (file: File, courseId: string): Promise<CurriculumImportResponse> => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : '';

        const formData = new FormData();
        formData.append('file', file);
        formData.append('courseId', courseId);

        try {
            const response = await axios.post<ApiResponse<CurriculumImportResponse>>(API_URL, formData, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.data.success) throw new Error(response.data.message);
            return response.data.data;
        } catch (error) {
            const err = error as AxiosError<ApiResponse<any>>;
            throw new Error(err.response?.data?.message || err.message || 'Lỗi khi tải tệp lên');
        }
    },
};
