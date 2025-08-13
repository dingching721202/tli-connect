'use client';

import RoleLogin from '@/components/RoleLogin';

export default function CorporateLoginPage() {
  return (
    <RoleLogin
      requiredRole="CORPORATE_CONTACT"
      roleDisplayName="企業窗口"
      roleColor="from-cyan-600 to-teal-600"
      redirectPath="/corporate_contact"
    />
  );
}