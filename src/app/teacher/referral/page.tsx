'use client';

import { useRouter } from 'next/navigation';
import RoleEntry from '@/components/RoleEntry';
import ReferralSystem from '@/components/ReferralSystem';

export default function TeacherReferralPage() {
  const router = useRouter();
  
  const handleClose = () => {
    router.push('/teacher');
  };

  return (
    <RoleEntry requiredRole="TEACHER">
      <ReferralSystem isOpen={true} onClose={handleClose} />
    </RoleEntry>
  );
}