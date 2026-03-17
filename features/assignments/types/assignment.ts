export type AssignmentType = 'QUIZ' | 'WRITING' | 'TRANSLATION';
export type AssignmentStatus = 'DRAFT' | 'PUBLISHED' | 'CLOSED';
export type SubmissionStatus = 'IN_PROGRESS' | 'SUBMITTED' | 'GRADED' | 'LATE' | 'CANCELLED';

export interface AssignmentSummary {
  id: string;
  title: string;
  description?: string;
  assignmentType: AssignmentType;
  dueDate: string;
  status: AssignmentStatus;
  classId: string;
  className: string;
  questionCount: number;
  submissionCount: number;
  maxScore?: number;
  passingScore?: number;
}

export interface QuizQuestion {
  id?: string;
  questionText: string;
  questionType?: string;
  options: any; // Can be string[] or JSON string depending on context
  correctAnswer?: string;
  correctAnswerIndex?: number;
  correctAnswers?: any;
  explanation?: string;
  audioUrl?: string;
  points?: number;
  orderIndex?: number;
}

export interface WritingContent {
  id: string;
  prompt?: string;
  sampleAnswer?: string;
  minWords?: number;
  maxWords?: number;
  sourceText?: string;
  targetText?: string;
  translationDirection?: 'JA_TO_VI' | 'VI_TO_JA';
}

export interface AssignmentDetail {
  id: string;
  title: string;
  description: string;
  instructions?: string;
  assignmentType: AssignmentType;
  dueDate: string;
  status: AssignmentStatus;
  classId: string;
  courseId?: string;
  lessonId?: string;
  questions?: QuizQuestion[];
  writingContent?: WritingContent;
  audioUrl?: string;
  maxScore?: number;
  passingScore?: number;
  questionCount?: number;
  submissionCount?: number;
  createdAt: string;
  updatedAt: string;
}

// Request Types
export interface SaveFullQuizRequest {
  title: string;
  description?: string;
  dueDate: string;
  questions: QuizQuestion[];
  status?: AssignmentStatus;
}

export interface SaveFullWritingRequest {
  title: string;
  description?: string;
  dueDate: string;
  prompt: string; // Used for validation (@NotBlank)
  writingPrompt?: string; // Used for mapping to entity
  sampleAnswer?: string;
  instructions?: string;
  sourceText?: string; // For translation
  translationDirection?: string;
  status?: AssignmentStatus;
}

export interface AiQuizGenerationRequest {
  classId: string;
  teacherPrompt: string;
  questionCount: number;
  difficulty?: string;
  topic?: string;
}

export interface CloneAssignmentRequest {
  targetClassId: string;
  newDueDate: string;
  newTitle?: string;
}

export interface GradeWritingRequest {
  teacherScore: number;
  feedback: string;
}

export interface AiExplanationRequest {
  questionText: string;
  questionType: string;
  options?: string; // JSON string
  correctAnswer?: string;
  correctAnswers?: string; // JSON string
}

// Submission Types
export interface SubmissionSummary {
  id: string;
  assignmentId: string;
  assignmentTitle: string;
  userId: string;
  userFullName: string;
  status: SubmissionStatus;
  attemptNumber: number;
  score?: number;
  passed?: boolean;
  submittedAt: string;
}

export interface SubmissionDetail {
  id: string;
  assignmentId: string;
  assignmentTitle: string;
  userId: string;
  userFullName: string;
  userEmail?: string;
  status: SubmissionStatus;
  attemptNumber: number;
  startedAt?: string;
  submittedAt?: string;
  gradedAt?: string;
  gradedBy?: string;
  score?: number;
  correctCount?: number;
  totalQuestions?: number;
  feedback?: string;
  passed?: boolean;
  timeSpentSeconds?: number;
  answers?: string; // JSON string
  writtenAnswer?: string;
  imageUrls?: string[];
  teacherScore?: number;
  createdAt: string;
}
