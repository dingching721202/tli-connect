import RoleEntry from '@/components/RoleEntry';
import ReferralSystemPage from '@/components/ReferralSystemPage';

export default function StudentReferralPage() {
  return (
    <RoleEntry requiredRole="STUDENT">
      <ReferralSystemPage />
    </RoleEntry>
  );
}