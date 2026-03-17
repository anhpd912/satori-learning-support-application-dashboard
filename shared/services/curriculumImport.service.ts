import axios, { AxiosError } from 'axios';

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1') + '/manager/curriculum-imports';

// --- Interfaces ---

export enum ImportStatus {
    QUEUED = 'QUEUED',
    PROCESSING = 'PROCESSING',
    PENDING_APPROVAL = 'PENDING_APPROVAL',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED',
    CANCELLED = 'CANCELLED',
    ROLLED_BACK = 'ROLLED_BACK'
}

export interface CurriculumImportResponse {
    id: string;
    courseId?: string;
    managerId: string;
    fileName: string;
    status: ImportStatus;
    errorMessage?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CurriculumImportSummaryResponse {
    id: string;
    courseId?: string;
    courseName?: string;
    fileName: string;
    status: ImportStatus;
    lessonCount: number;
    createdAt: string;
}

export interface ImportChunkResponse {
    id: string;
    importId: string;
    chunkIndex: number;
    rawText: string;
    status: string;
}

export interface LessonSummaryDto {
    id: string;
    title: string;
    vocabCount: number;
    grammarCount: number;
}

export interface VocabularyResponse {
    id: string;
    hiragana: string;
    kanji?: string;
    meaning: string;
    example?: string;
}

export interface GrammarPointResponse {
    id: string;
    title: string;
    structure: string;
    explanation: string;
}

export interface ImportStatisticsResponse {
    totalImports: number;
    completedCount: number;
    failedCount: number;
    pendingApprovalCount: number;
}

export interface PageResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

// --- Utils ---

const getAuthToken = () => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('accessToken');
    }
    return null;
};

const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
});

axiosInstance.interceptors.request.use((config) => {
    const token = getAuthToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

const handleResponse = <T>(response: any): T => {
    if (response.data && response.data.success) {
        return response.data.data;
    }
    throw new Error(response.data?.message || 'Lỗi hệ thống');
};

const handleError = (error: any) => {
    const err = error as AxiosError<ApiResponse<any>>;
    throw new Error(err.response?.data?.message || err.message || 'Lỗi kết nối Server');
};

// --- Service ---

export const curriculumImportService = {
    /**
     * Upload a PDF and initiate curriculum import.
     */
    initiateImport: async (file: File, courseId?: string): Promise<CurriculumImportResponse> => {
        const formData = new FormData();
        formData.append('file', file);
        if (courseId) formData.append('courseId', courseId);

        try {
            const response = await axiosInstance.post<ApiResponse<CurriculumImportResponse>>('', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return handleResponse(response);
        } catch (error) {
            return handleError(error);
        }
    },

    /**
     * Get import status by ID.
     */
    getImportById: async (importId: string): Promise<CurriculumImportResponse> => {
        try {
            const response = await axiosInstance.get<ApiResponse<CurriculumImportResponse>>(`/${importId}`);
            return handleResponse(response);
        } catch (error) {
            return handleError(error);
        }
    },

    /**
     * List all imports with optional filters.
     */
    listImports: async (params: { courseId?: string, status?: ImportStatus, page?: number, size?: number }): Promise<PageResponse<CurriculumImportSummaryResponse>> => {
        try {
            const response = await axiosInstance.get<ApiResponse<PageResponse<CurriculumImportSummaryResponse>>>('', { params });
            return handleResponse(response);
        } catch (error) {
            return handleError(error);
        }
    },

    /**
     * Get chunks for a specific import.
     */
    getImportChunks: async (importId: string, page = 0, size = 20): Promise<PageResponse<ImportChunkResponse>> => {
        try {
            const response = await axiosInstance.get<ApiResponse<PageResponse<ImportChunkResponse>>>(`/${importId}/chunks`, { params: { page, size } });
            return handleResponse(response);
        } catch (error) {
            return handleError(error);
        }
    },

    /**
     * Retry a failed import.
     */
    retryImport: async (importId: string): Promise<CurriculumImportResponse> => {
        try {
            const response = await axiosInstance.post<ApiResponse<CurriculumImportResponse>>(`/${importId}/retry`);
            return handleResponse(response);
        } catch (error) {
            return handleError(error);
        }
    },

    /**
     * Cancel an in-progress or queued import.
     */
    cancelImport: async (importId: string): Promise<CurriculumImportResponse> => {
        try {
            const response = await axiosInstance.post<ApiResponse<CurriculumImportResponse>>(`/${importId}/cancel`);
            return handleResponse(response);
        } catch (error) {
            return handleError(error);
        }
    },

    /**
     * Approve a PENDING_APPROVAL import.
     */
    approveImport: async (importId: string): Promise<CurriculumImportResponse> => {
        try {
            const response = await axiosInstance.post<ApiResponse<CurriculumImportResponse>>(`/${importId}/approve`);
            return handleResponse(response);
        } catch (error) {
            return handleError(error);
        }
    },

    /**
     * Reject a PENDING_APPROVAL import.
     */
    rejectImport: async (importId: string): Promise<CurriculumImportResponse> => {
        try {
            const response = await axiosInstance.post<ApiResponse<CurriculumImportResponse>>(`/${importId}/reject`);
            return handleResponse(response);
        } catch (error) {
            return handleError(error);
        }
    },

    /**
     * Rollback a COMPLETED import.
     */
    rollbackImport: async (importId: string): Promise<CurriculumImportResponse> => {
        try {
            const response = await axiosInstance.post<ApiResponse<CurriculumImportResponse>>(`/${importId}/rollback`);
            return handleResponse(response);
        } catch (error) {
            return handleError(error);
        }
    },

    /**
     * Link a completed import to a course.
     */
    linkToCourse: async (importId: string, courseId: string): Promise<CurriculumImportResponse> => {
        try {
            const response = await axiosInstance.patch<ApiResponse<CurriculumImportResponse>>(`/${importId}/link-course`, null, { params: { courseId } });
            return handleResponse(response);
        } catch (error) {
            return handleError(error);
        }
    },

    /**
     * Get lessons created by a specific import.
     */
    getImportLessons: async (importId: string): Promise<LessonSummaryDto[]> => {
        try {
            const response = await axiosInstance.get<ApiResponse<LessonSummaryDto[]>>(`/${importId}/lessons`);
            return handleResponse(response);
        } catch (error) {
            return handleError(error);
        }
    },

    /**
     * Get vocabulary extracted by a specific import.
     */
    getImportVocabulary: async (importId: string, page = 0, size = 20): Promise<PageResponse<VocabularyResponse>> => {
        try {
            const response = await axiosInstance.get<ApiResponse<PageResponse<VocabularyResponse>>>(`/${importId}/vocabulary`, { params: { page, size } });
            return handleResponse(response);
        } catch (error) {
            return handleError(error);
        }
    },

    /**
     * Get grammar points extracted by a specific import.
     */
    getImportGrammarPoints: async (importId: string, page = 0, size = 20): Promise<PageResponse<GrammarPointResponse>> => {
        try {
            const response = await axiosInstance.get<ApiResponse<PageResponse<GrammarPointResponse>>>(`/${importId}/grammar-points`, { params: { page, size } });
            return handleResponse(response);
        } catch (error) {
            return handleError(error);
        }
    },

    /**
     * Get import statistics for dashboard.
     */
    getStatistics: async (): Promise<ImportStatisticsResponse> => {
        try {
            const response = await axiosInstance.get<ApiResponse<ImportStatisticsResponse>>('/statistics');
            return handleResponse(response);
        } catch (error) {
            return handleError(error);
        }
    }
};
