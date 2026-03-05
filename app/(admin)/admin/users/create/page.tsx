'use client';
import CreateUserFeature from '@/shared/features/users/CreateUserFeature';

export default function AdminCreateUserPage() {
  return <CreateUserFeature currentRole="ADMIN" />;
}