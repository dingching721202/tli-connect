import RoleEntry from '@/components/RoleEntry';
import MemberManagement from '@/components/MemberManagement';

export default function StaffMemberManagementPage() {
  return (
    <RoleEntry requiredRole="STAFF">
      <MemberManagement />
    </RoleEntry>
  );
}