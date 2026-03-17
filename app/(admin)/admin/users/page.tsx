'use client';

import UserListFeature from '@/features/users/UserListFeature';

export default function AdminUserPage() {
  return <UserListFeature role="ADMIN" />;
}