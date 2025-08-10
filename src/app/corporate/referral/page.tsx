import RoleEntry from '@/components/RoleEntry';
import ReferralSystemPage from '@/components/ReferralSystemPage';

export default function CorporateReferralPage() {
  return (
    <RoleEntry requiredRole="CORPORATE_CONTACT">
      <ReferralSystemPage />
    </RoleEntry>
  );
}