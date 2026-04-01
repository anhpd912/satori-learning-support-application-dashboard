import api from '@/lib/axios';

export interface LessonSummaryResponse {
    id: string;
    title: string;
    vocabularyCount: number;
    grammarPointCount: number;
    status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
    orderIndex: number;
    description?: string;
}

export interface LessonResponse extends LessonSummaryResponse {
    vocabulary: any[];
    grammar: any[];
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

class LessonService {
    private readonly API_URL = process.env.NEXT_PUBLIC_API_URL + '/manager/lessons';

    async getLessonsByCourseId(
        courseId: string,
        page: number = 0,
        size: number = 20,
        keyword?: string
    ) {
        try {
            const params = new URLSearchParams();
            params.append('courseId', courseId);
            params.append('page', page.toString());
            params.append('size', size.toString());
            
            if (keyword && keyword.trim() !== '') {
                params.append('keyword', keyword.trim());
            }

            const response = await api.get<ApiResponse<PageResponse<LessonSummaryResponse>>>(this.API_URL, { 
                params: params
            });

            return response.data.data;
        } catch (error) {
            console.error("Lỗi khi fetch lessons:", error);
            throw error;
        }
    }

    async getLessonById(lessonId: string) {
        try {
            const response = await api.get<ApiResponse<LessonResponse>>(`${this.API_URL}/${lessonId}`);
            return response.data.data;
        } catch (error) {
            console.error("Lỗi khi fetch lesson detail:", error);
            throw error;
        }
    }

    async getVocabularyByLesson(lessonId: string) {
        try {
            const response = await api.get<ApiResponse<any[]>>(`${process.env.NEXT_PUBLIC_API_URL}/manager/vocabulary/by-lesson/${lessonId}`);
            return response.data.data;
        } catch (error) {
            console.error("Lỗi khi fetch vocabulary by lesson:", error);
            throw error;
        }
    }

    async getGrammarByLesson(lessonId: string) {
        try {
            const response = await api.get<ApiResponse<any[]>>(`${process.env.NEXT_PUBLIC_API_URL}/manager/grammar-points/by-lesson/${lessonId}`);
            return response.data.data;
        } catch (error) {
            console.error("Lỗi khi fetch grammar by lesson:", error);
            throw error;
        }
    }

    async updateLesson(lessonId: string, data: any) {
        try {
            const response = await api.put<ApiResponse<any>>(`${this.API_URL}/${lessonId}`, data);
            return response.data.data;
        } catch (error) {
            console.error("Lỗi khi update lesson:", error);
            throw error;
        }
    }

    async publishLesson(lessonId: string) {
        try {
            const response = await api.patch<ApiResponse<LessonResponse>>(`${this.API_URL}/${lessonId}/publish`);
            return response.data.data;
        } catch (error) {
            console.error("Lỗi khi publish lesson:", error);
            throw error;
        }
    }

    async archiveLesson(lessonId: string) {
        try {
            const response = await api.patch<ApiResponse<LessonResponse>>(`${this.API_URL}/${lessonId}/archive`);
            return response.data.data;
        } catch (error) {
            console.error("Lỗi khi archive lesson:", error);
            throw error;
        }
    }

    async createLesson(data: { title: string; description?: string; courseId: string; orderIndex?: number }) {
        try {
            const response = await api.post<ApiResponse<any>>(this.API_URL, data);
            return response.data.data;
        } catch (error) {
            console.error("Lỗi khi tạo lesson:", error);
            throw error;
        }
    }

    async createVocabulary(data: any) {
        try {
            const response = await api.post<ApiResponse<any>>(`${process.env.NEXT_PUBLIC_API_URL}/manager/vocabulary`, data);
            return response.data.data;
        } catch (error) {
            console.error("Lỗi khi tạo vocabulary:", error);
            throw error;
        }
    }

    async updateVocabulary(vocabId: string, data: any) {
        try {
            const response = await api.put<ApiResponse<any>>(`${process.env.NEXT_PUBLIC_API_URL}/manager/vocabulary/${vocabId}`, data);
            return response.data.data;
        } catch (error) {
            console.error("Lỗi khi update vocabulary:", error);
            throw error;
        }
    }

    async deleteVocabulary(vocabId: string) {
        try {
            await api.delete(`${process.env.NEXT_PUBLIC_API_URL}/manager/vocabulary/${vocabId}`);
        } catch (error) {
            console.error("Lỗi khi xóa vocabulary:", error);
            throw error;
        }
    }

    async createGrammarPoint(data: any) {
        try {
            const response = await api.post<ApiResponse<any>>(`${process.env.NEXT_PUBLIC_API_URL}/manager/grammar-points`, data);
            return response.data.data;
        } catch (error) {
            console.error("Lỗi khi tạo grammar point:", error);
            throw error;
        }
    }

    async updateGrammarPoint(grammarId: string, data: any) {
        try {
            const response = await api.put<ApiResponse<any>>(`${process.env.NEXT_PUBLIC_API_URL}/manager/grammar-points/${grammarId}`, data);
            return response.data.data;
        } catch (error) {
            console.error("Lỗi khi update grammar point:", error);
            throw error;
        }
    }

    async deleteGrammarPoint(grammarId: string) {
        try {
            await api.delete(`${process.env.NEXT_PUBLIC_API_URL}/manager/grammar-points/${grammarId}`);
        } catch (error) {
            console.error("Lỗi khi xóa grammar point:", error);
            throw error;
        }
    }
}

export const lessonService = new LessonService();
