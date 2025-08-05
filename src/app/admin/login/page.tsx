'use client';

import RoleLogin from '@/components/RoleLogin';

export default function AdminLoginPage() {
  return (
    <RoleLogin
      requiredRole="ADMIN"
      roleDisplayName="系統管理員"
      roleColor="from-red-600 to-rose-600"
      redirectPath="/admin"
    />
  );
}