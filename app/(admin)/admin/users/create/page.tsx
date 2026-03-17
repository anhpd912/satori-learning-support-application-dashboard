'use client';
import CreateUserFeature from '@/features/users/CreateUserFeature';

export default function AdminCreateUserPage() {
  return <CreateUserFeature currentRole="ADMIN" />;
}