'use client';

import { useRouter } from 'next/navigation';
import RoleEntry from '@/components/RoleEntry';
import ReferralSystem from '@/components/ReferralSystem';

export default function AdminReferralPage() {
  const router = useRouter();
  
  const handleClose = () => {
    router.push('/admin');
  };

  return (
    <RoleEntry requiredRole="ADMIN">
      <ReferralSystem isOpen={true} onClose={handleClose} />
    </RoleEntry>
  );
}