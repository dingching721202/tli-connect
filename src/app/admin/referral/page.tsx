import RoleEntry from '@/components/RoleEntry';
import ReferralSystemPage from '@/components/ReferralSystemPage';

export default function AdminReferralPage() {
  return (
    <RoleEntry requiredRole="ADMIN">
      <ReferralSystemPage />
    </RoleEntry>
  );
}