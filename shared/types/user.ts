export type UserRole = 'TEACHER' | 'LEARNER' | 'MANAGER' | 'ADMIN';
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