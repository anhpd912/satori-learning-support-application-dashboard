'use client';
import CreateUserFeature from '@/shared/features/users/CreateUserFeature';

export default function AdminCreateUserPage() {
  // Admin được quyền tạo tất cả
  return <CreateUserFeature currentRole="ADMIN" />;
}