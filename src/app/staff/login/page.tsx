'use client';

import RoleLogin from '@/components/RoleLogin';

export default function StaffLoginPage() {
  return (
    <RoleLogin
      requiredRole="STAFF"
      roleDisplayName="職員"
      roleColor="from-purple-600 to-violet-600"
      redirectPath="/staff"
    />
  );
}