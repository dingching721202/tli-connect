'use client';

import { useRouter } from 'next/navigation';
import RoleEntry from '@/components/RoleEntry';
import ReferralSystem from '@/components/ReferralSystem';

export default function CorporateReferralPage() {
  const router = useRouter();
  
  const handleClose = () => {
    router.push('/corporate');
  };

  return (
    <RoleEntry requiredRole="CORPORATE_CONTACT">
      <ReferralSystem isOpen={true} onClose={handleClose} />
    </RoleEntry>
  );
}