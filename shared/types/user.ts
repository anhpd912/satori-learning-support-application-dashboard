export type UserRole = 'TEACHER' | 'LEARNER' | 'CONTENT_MANAGER' | 'OPERATION_MANAGER' | 'ADMIN';
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'DELETED';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  displayName: string;
  status: UserStatus;
  avatarUrl: string;
  createdAt: string;
  phoneNumber: string;
  dateOfBirth: string;
}