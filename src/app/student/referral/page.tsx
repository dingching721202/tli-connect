'use client';

import { useRouter } from 'next/navigation';
import RoleEntry from '@/components/RoleEntry';
import ReferralSystem from '@/components/ReferralSystem';

export default function StudentReferralPage() {
  const router = useRouter();
  
  const handleClose = () => {
    router.push('/student');
  };

  return (
    <RoleEntry requiredRole="STUDENT">
      <ReferralSystem isOpen={true} onClose={handleClose} />
    </RoleEntry>
  );
}