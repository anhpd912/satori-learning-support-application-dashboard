import api from '@/lib/axios';
import { 
    AssignmentSummary, 
    AssignmentDetail, 
    SaveFullQuizRequest, 
    SaveFullWritingRequest,
    AiQuizGenerationRequest,
    CloneAssignmentRequest,
    GradeWritingRequest,
    SubmissionSummary,
    SubmissionDetail
} from '../types/assignment';

export interface ApiResponse<T> {
    success: boolean;
    code: string;
    message: string;
    data: T;
}

export interface PageResponse<T> {
    content: T[];
    pageNumber: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
}

class AssignmentService {
    private readonly API_URL = '/teacher/assignments';

    // List all assignments created by current teacher
    async getMyAssignments(
        page: number = 1, 
        size: number = 10, 
        title?: string, 
        status?: string, 
        type?: string
    ) {
        const response = await api.get<ApiResponse<PageResponse<AssignmentSummary>>>(this.API_URL, {
            params: { page, size, title, status, type }
        });
        return response.data.data;
    }

    // List all assignments for a specific class
    async getClassAssignments(
        classId: string, 
        page: number = 1, 
        size: number = 10, 
        title?: string, 
        status?: string, 
        type?: string
    ) {
        const response = await api.get<ApiResponse<PageResponse<AssignmentSummary>>>(`${this.API_URL}/class/${classId}`, {
            params: { page, size, title, status, type }
        });
        return response.data.data;
    }

    // Get assignment details
    async getAssignment(id: string) {
        const response = await api.get<ApiResponse<AssignmentDetail>>(`${this.API_URL}/${id}`);
        return response.data.data;
    }

    // Create/Update Full Quiz
    async saveFullQuiz(classId: string | null, assignmentId: string | null, data: SaveFullQuizRequest, audioFile?: File) {
        // Transform questions to match backend DTO (QuizQuestionDraftDto)
        const transformedData = {
            ...data,
            questions: data.questions.map((q, idx) => ({
                ...q,
                questionType: q.questionType || 'multiple_choice',
                options: Array.isArray(q.options) ? JSON.stringify(q.options) : q.options,
                correctAnswer: (Array.isArray(q.options) && q.correctAnswerIndex !== undefined) ? (q.options as string[])[q.correctAnswerIndex] : '',
                points: q.points || 10,
                orderIndex: idx
            }))
        };
        
        console.log('📡 [API Request] POST/PUT /quiz - Transformed Data:', transformedData);

        const formData = new FormData();
        formData.append('data', new Blob([JSON.stringify(transformedData)], { type: 'application/json' }));
        if (audioFile) {
            formData.append('audioFile', audioFile);
        }

        if (assignmentId) {
            // Update
            const response = await api.put<ApiResponse<AssignmentDetail>>(`${this.API_URL}/${assignmentId}/quiz`, formData);
            return response.data.data;
        } else {
            // Create
            const response = await api.post<ApiResponse<AssignmentDetail>>(`${this.API_URL}/class/${classId}/quiz`, formData);
            return response.data.data;
        }
    }

    // Create/Update Writing/Translation
    async saveFullWriting(classId: string | null, assignmentId: string | null, data: SaveFullWritingRequest, isTranslation: boolean = false) {
        const type = isTranslation ? 'translation' : 'writing';
        
        // Transform translation direction if needed
        let transformedData = { ...data };
        if (isTranslation && data.translationDirection) {
            transformedData.translationDirection = data.translationDirection === 'JA_VI' ? 'JA_TO_VI' : 
                                                 data.translationDirection === 'VI_JA' ? 'VI_TO_JA' : 
                                                 data.translationDirection;
        }
        
        console.log(`📡 [API Request] POST/PUT /${type} - Transformed Data:`, transformedData);

        if (assignmentId) {
            const response = await api.put<ApiResponse<AssignmentDetail>>(`${this.API_URL}/${assignmentId}/${type}`, transformedData);
            return response.data.data;
        } else {
            const response = await api.post<ApiResponse<AssignmentDetail>>(`${this.API_URL}/class/${classId}/${type}`, transformedData);
            return response.data.data;
        }
    }

    // AI question generation preview
    async aiGenerateQuestions(request: AiQuizGenerationRequest) {
        const response = await api.post<ApiResponse<any[]>>(`${this.API_URL}/questions/ai-generate`, request);
        return response.data.data;
    }

    // AI explanation for existing question
    async aiGenerateExplanation(questionId: string) {
        const response = await api.post<ApiResponse<any>>(`${this.API_URL}/questions/${questionId}/ai-explain`);
        return response.data.data;
    }

    // AI explanation for draft question
    async aiGenerateExplanationFromDraft(request: any) {
        // Ensure options and correctAnswers are stringified for backend String fields
        const payload = {
            ...request,
            options: typeof request.options === 'object' ? JSON.stringify(request.options) : request.options,
            correctAnswers: typeof request.correctAnswers === 'object' ? JSON.stringify(request.correctAnswers) : request.correctAnswers,
        };
        const response = await api.post<ApiResponse<{ explanation: string }>>(`${this.API_URL}/questions/ai-explain-draft`, payload);
        return response.data.data;
    }

    // Clone assignment
    async cloneAssignment(id: string, request: CloneAssignmentRequest) {
        const response = await api.post<ApiResponse<AssignmentDetail>>(`${this.API_URL}/${id}/clone`, request);
        return response.data.data;
    }

    // Delete assignment
    async deleteAssignment(id: string) {
        await api.delete(`${this.API_URL}/${id}`);
    }

    // SUBMISSIONS

    async getSubmissions(assignmentId: string, page: number = 1, size: number = 10) {
        const response = await api.get<PageResponse<SubmissionSummary>>(`${this.API_URL}/${assignmentId}/submissions`, {
            params: { page, size }
        });
        return response.data;
    }

    async getSubmissionDetail(submissionId: string) {
        const response = await api.get<ApiResponse<SubmissionDetail>>(`${this.API_URL}/submissions/${submissionId}`);
        return response.data.data;
    }

    async gradeWritingSubmission(submissionId: string, request: GradeWritingRequest) {
        const response = await api.post<ApiResponse<SubmissionDetail>>(`${this.API_URL}/submissions/${submissionId}/grade-writing`, request);
        return response.data.data;
    }
}

export const assignmentService = new AssignmentService();
