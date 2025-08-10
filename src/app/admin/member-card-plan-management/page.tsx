import RoleEntry from '@/components/RoleEntry';
import MemberCardPlanManagement from '@/components/MemberCardPlanManagement';

export default function AdminMemberCardPlanManagementPage() {
  return (
    <RoleEntry requiredRole="ADMIN">
      <MemberCardPlanManagement />
    </RoleEntry>
  );
}