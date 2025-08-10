import RoleEntry from '@/components/RoleEntry';
import MemberManagement from '@/components/MemberManagement';

export default function AdminMemberManagementPage() {
  return (
    <RoleEntry requiredRole="ADMIN">
      <MemberManagement />
    </RoleEntry>
  );
}