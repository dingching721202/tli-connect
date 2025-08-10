'use client';

import { useState } from 'react';
import RoleEntry from '@/components/RoleEntry';
import ReferralSystem from '@/components/ReferralSystem';

export default function StaffReferralPage() {
  return (
    <RoleEntry requiredRole="STAFF">
      <ReferralSystem isOpen={true} onClose={() => {}} />
    </RoleEntry>
  );
}