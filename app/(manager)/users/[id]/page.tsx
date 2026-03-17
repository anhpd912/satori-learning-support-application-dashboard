
import React, { use } from 'react';
import UserDetailFeature from '@/features/users/UserDetailFeature';

export default function ManagerUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <UserDetailFeature userId={id} role="MANAGER" />;
}