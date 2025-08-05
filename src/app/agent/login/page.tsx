'use client';

import RoleLogin from '@/components/RoleLogin';

export default function AgentLoginPage() {
  return (
    <RoleLogin
      requiredRole="AGENT"
      roleDisplayName="代理商"
      roleColor="from-yellow-600 to-amber-600"
      redirectPath="/agent"
    />
  );
}