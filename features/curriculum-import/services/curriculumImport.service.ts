import api from '@/lib/axios';

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
    originalFilename: string;
    status: ImportStatus;
    errorMessage?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CurriculumImportSummaryResponse {
    id: string;
    courseId?: string;
    courseName?: string;
    fileName?: string;
    originalFilename: string;
    status: ImportStatus;
    lessonsCreated: number;
    vocabularyCreated: number;
    grammarPointsCreated: number;
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
    vocabularyCount: number;
    grammarPointCount: number;
}

export interface VocabularyResponse {
    id: string;
    japaneseText: string;
    reading: string;
    romaji?: string;
    meaningVi: string;
    meaningEn?: string;
    partOfSpeech?: string;
    kanjiWriting?: string;
    usageNotes?: string;
    tags?: string[];
}

export interface GrammarPointResponse {
    id: string;
    pattern: string;
    patternReading?: string;
    meaningVi: string;
    meaningEn?: string;
    shortExplanation: string;
    tags?: string[];
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

const handleResponse = <T>(response: any): T => {
    if (response.data && response.data.success) {
        return response.data.data;
    }
    throw new Error(response.data?.message || 'Lỗi hệ thống');
};

const handleError = (error: any): never => {
    const message = error?.response?.data?.message || error?.message || 'Lỗi kết nối Server';
    throw new Error(message);
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
            const response = await api.post<ApiResponse<CurriculumImportResponse>>(API_BASE_URL, formData, {
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
            const response = await api.get<ApiResponse<CurriculumImportResponse>>(`${API_BASE_URL}/${importId}`);
            return handleResponse(response);
        } catch (error) {
            return handleError(error);
        }
    },

    /**
     * List all imports with optional filters.
     */
    listImports: async (params: { courseId?: string; status?: ImportStatus; page?: number; size?: number }): Promise<PageResponse<CurriculumImportSummaryResponse>> => {
        try {
            const response = await api.get<ApiResponse<PageResponse<CurriculumImportSummaryResponse>>>(API_BASE_URL, { params });
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
            const response = await api.get<ApiResponse<PageResponse<ImportChunkResponse>>>(`${API_BASE_URL}/${importId}/chunks`, { params: { page, size } });
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
            const response = await api.post<ApiResponse<CurriculumImportResponse>>(`${API_BASE_URL}/${importId}/retry`);
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
            const response = await api.post<ApiResponse<CurriculumImportResponse>>(`${API_BASE_URL}/${importId}/cancel`);
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
            const response = await api.post<ApiResponse<CurriculumImportResponse>>(`${API_BASE_URL}/${importId}/approve`);
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
            const response = await api.post<ApiResponse<CurriculumImportResponse>>(`${API_BASE_URL}/${importId}/reject`);
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
            const response = await api.post<ApiResponse<CurriculumImportResponse>>(`${API_BASE_URL}/${importId}/rollback`);
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
            const response = await api.patch<ApiResponse<CurriculumImportResponse>>(`${API_BASE_URL}/${importId}/link-course`, null, { params: { courseId } });
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
            const response = await api.get<ApiResponse<LessonSummaryDto[]>>(`${API_BASE_URL}/${importId}/lessons`);
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
            const response = await api.get<ApiResponse<PageResponse<VocabularyResponse>>>(`${API_BASE_URL}/${importId}/vocabulary`, { params: { page, size } });
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
            const response = await api.get<ApiResponse<PageResponse<GrammarPointResponse>>>(`${API_BASE_URL}/${importId}/grammar-points`, { params: { page, size } });
            return handleResponse(response);
        } catch (error) {
            return handleError(error);
        }
    },

    /**
     * Get import statistics for dashboard.
     */
    getStatistics: async (courseId?: string): Promise<ImportStatisticsResponse> => {
        try {
            const response = await api.get<ApiResponse<ImportStatisticsResponse>>(`${API_BASE_URL}/statistics`, { params: { courseId } });
            return handleResponse(response);
        } catch (error) {
            return handleError(error);
        }
    }
};
