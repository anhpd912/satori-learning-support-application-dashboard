
import React, { use } from 'react';
import UpdateUserFeature from '@/features/users/UpdateUserFeature';

export default function ManagerUpdatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <UpdateUserFeature userId={id} currentRole="MANAGER" />;
}