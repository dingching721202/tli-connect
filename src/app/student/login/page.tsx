'use client';

import RoleLogin from '@/components/RoleLogin';

export default function StudentLoginPage() {
  return (
    <RoleLogin
      requiredRole="STUDENT"
      roleDisplayName="學生"
      roleColor="from-blue-600 to-indigo-600"
      redirectPath="/student"
    />
  );
}