import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { assignmentService } from '../services/assignment.service';
import { 
    SaveFullQuizRequest, 
    SaveFullWritingRequest, 
    AiQuizGenerationRequest,
    CloneAssignmentRequest,
    GradeWritingRequest
} from '../types/assignment';

export const assignmentKeys = {
    all: ['assignments'] as const,
    teacher: () => [...assignmentKeys.all, 'teacher'] as const,
    teacherList: (page: number, size: number, filters?: { title?: string; status?: string; type?: string }) => 
        [...assignmentKeys.teacher(), { page, size, ...filters }] as const,
    class: (classId: string) => [...assignmentKeys.all, 'class', classId] as const,
    classList: (classId: string, page: number, size: number, filters?: { title?: string; status?: string; type?: string }) => 
        [...assignmentKeys.class(classId), { page, size, ...filters }] as const,
    detail: (id: string) => [...assignmentKeys.all, 'detail', id] as const,
    submissions: (assignmentId: string, page: number, size: number) => [...assignmentKeys.all, 'submissions', assignmentId, { page, size }] as const,
    submissionDetail: (id: string) => [...assignmentKeys.all, 'submissionDetail', id] as const,
};

export const useMyAssignments = (page: number, size: number, filters?: { title?: string; status?: string; type?: string }) => {
    return useQuery({
        queryKey: assignmentKeys.teacherList(page, size, filters),
        queryFn: () => assignmentService.getMyAssignments(page, size, filters?.title, filters?.status, filters?.type),
    });
};

export const useClassAssignments = (classId: string, page: number, size: number, filters?: { title?: string; status?: string; type?: string }) => {
    return useQuery({
        queryKey: assignmentKeys.classList(classId, page, size, filters),
        queryFn: () => assignmentService.getClassAssignments(classId, page, size, filters?.title, filters?.status, filters?.type),
        enabled: !!classId,
    });
};

export const useAssignmentDetail = (id: string) => {
    return useQuery({
        queryKey: assignmentKeys.detail(id),
        queryFn: () => assignmentService.getAssignment(id),
        enabled: !!id,
    });
};

export const useCreateQuiz = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ classId, data, audioFile }: { classId: string; data: SaveFullQuizRequest; audioFile?: File }) =>
            assignmentService.saveFullQuiz(classId, null, data, audioFile),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: assignmentKeys.class(variables.classId) });
            queryClient.invalidateQueries({ queryKey: assignmentKeys.teacher() });
        },
    });
};

export const useUpdateQuiz = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ assignmentId, data, audioFile }: { assignmentId: string; data: SaveFullQuizRequest; audioFile?: File }) =>
            assignmentService.saveFullQuiz(null, assignmentId, data, audioFile),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: assignmentKeys.detail(variables.assignmentId) });
            queryClient.invalidateQueries({ queryKey: assignmentKeys.all });
        },
    });
};

export const useCreateWriting = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ classId, data, isTranslation }: { classId: string; data: SaveFullWritingRequest; isTranslation?: boolean }) =>
            assignmentService.saveFullWriting(classId, null, data, isTranslation),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: assignmentKeys.class(variables.classId) });
            queryClient.invalidateQueries({ queryKey: assignmentKeys.teacher() });
        },
    });
};

export const useUpdateWriting = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ assignmentId, data, isTranslation }: { assignmentId: string; data: SaveFullWritingRequest; isTranslation?: boolean }) =>
            assignmentService.saveFullWriting(null, assignmentId, data, isTranslation),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: assignmentKeys.detail(variables.assignmentId) });
            queryClient.invalidateQueries({ queryKey: assignmentKeys.all });
        },
    });
};

export const useDeleteAssignment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => assignmentService.deleteAssignment(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: assignmentKeys.all });
        },
    });
};

export const useAiGenerateQuestions = () => {
    return useMutation({
        mutationFn: (request: AiQuizGenerationRequest) => assignmentService.aiGenerateQuestions(request),
    });
};

export const useAiGenerateExplanationFromDraft = () => {
    return useMutation({
        mutationFn: (request: any) => assignmentService.aiGenerateExplanationFromDraft(request),
    });
};

export const useCloneAssignment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, request }: { id: string; request: CloneAssignmentRequest }) =>
            assignmentService.cloneAssignment(id, request),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: assignmentKeys.class(variables.request.targetClassId) });
        },
    });
};

export const useAssignmentSubmissions = (assignmentId: string, page: number, size: number) => {
    return useQuery({
        queryKey: assignmentKeys.submissions(assignmentId, page, size),
        queryFn: () => assignmentService.getSubmissions(assignmentId, page, size),
        enabled: !!assignmentId,
    });
};

export const useSubmissionDetail = (submissionId: string) => {
    return useQuery({
        queryKey: assignmentKeys.submissionDetail(submissionId),
        queryFn: () => assignmentService.getSubmissionDetail(submissionId),
        enabled: !!submissionId,
    });
};

export const useGradeWriting = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ submissionId, request }: { submissionId: string; request: GradeWritingRequest }) =>
            assignmentService.gradeWritingSubmission(submissionId, request),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: assignmentKeys.submissionDetail(variables.submissionId) });
        },
    });
};
