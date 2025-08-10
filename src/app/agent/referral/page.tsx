'use client';

import { useState } from 'react';
import RoleEntry from '@/components/RoleEntry';
import ReferralSystem from '@/components/ReferralSystem';

export default function AgentReferralPage() {
  return (
    <RoleEntry requiredRole="AGENT">
      <ReferralSystem isOpen={true} onClose={() => {}} />
    </RoleEntry>
  );
}