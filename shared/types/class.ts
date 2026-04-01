// Interface dữ liệu trả về từ Backend (DTO)
export interface ClassBackendDTO {
    id: string;
    name: string;
    courseId: string;
    courseName: string;
    teacherId: string;
    teacherName: string;
    courseLevel: string;
    courseStatus: string;
    isActive: boolean;
    memberCount: number;
    maxStudents: number | null;
}

// Interface dữ liệu dùng trong Frontend (Model)
export interface ClassModel {
    id: string;
    name: string;
    course: string;
    teacherName: string;
    studentCount: number;
    maxStudents: number | null;
    status: 'Active' | 'Inactive';
}

export interface CreateClassPayload {
    name: string;
    description?: string;
    teacherId: string;
    courseId: string;
    maxStudents?: number;
    startDate?: string;
    endDate?: string;
}

export interface UpdateClassPayload {
    name: string;
    description?: string;
    teacherId?: string;
    maxStudents?: number;
    startDate?: string;
    endDate?: string;
    isActive?: boolean;
}

export interface ClassResponse {
    id: string;
    name: string;
    description: string;
    teacherId: string;
    courseId: string;
    courseName: string;
    courseLevel: string;
    courseStatus: string;
    maxStudents: number;
    startDate: string;
    endDate: string;
    isActive: boolean;
    createdBy: string;
    updatedBy: string;
    createdAt: string;
    updatedAt: string;
    memberCount: number;
    teacherName: string;
    teacherEmail: string;
    teacherAvatarUrl: string;
    teacherPhoneNumber: string;
}

export interface ClassMemberResponse {
    id: string;
    classId: string;
    userId: string;
    joinedAt: string;
    removedAt: string | null;
    fullName: string;
    email: string;
    avatarUrl: string | null;
    role: string;
}

export interface UserResponse {
    id: string;
    fullName: string;
    email: string;
    avatarUrl: string | null;
    phoneNumber?: string;
    code?: string;
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
    message: string;
    data: T;
}
