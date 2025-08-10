import RoleEntry from '@/components/RoleEntry';
import ReferralSystemPage from '@/components/ReferralSystemPage';

export default function StaffReferralPage() {
  return (
    <RoleEntry requiredRole="STAFF">
      <ReferralSystemPage />
    </RoleEntry>
  );
}