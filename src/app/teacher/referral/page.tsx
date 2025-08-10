import RoleEntry from '@/components/RoleEntry';
import ReferralSystemPage from '@/components/ReferralSystemPage';

export default function TeacherReferralPage() {
  return (
    <RoleEntry requiredRole="TEACHER">
      <ReferralSystemPage />
    </RoleEntry>
  );
}