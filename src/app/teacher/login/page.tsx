'use client';

import RoleLogin from '@/components/RoleLogin';

export default function TeacherLoginPage() {
  return (
    <RoleLogin
      requiredRole="TEACHER"
      roleDisplayName="教師"
      roleColor="from-green-600 to-emerald-600"
      redirectPath="/teacher"
    />
  );
}