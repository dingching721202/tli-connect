import RoleEntry from '@/components/RoleEntry';
import LeaveManagement from '@/components/LeaveManagement';

export default function AdminLeaveManagementPage() {
  return (
    <RoleEntry requiredRole="ADMIN">
      <LeaveManagement />
    </RoleEntry>
  );
}