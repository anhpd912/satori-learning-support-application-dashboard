'use client';

import React, { use } from 'react';
import UserDetailFeature from '@/shared/features/users/UserDetailFeature';

export default function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return <UserDetailFeature userId={id} role="ADMIN" />;
}