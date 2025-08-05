import RoleEntry from '@/components/RoleEntry';
import AccountManagement from '@/components/AccountManagement';

export default function AdminAccountManagementPage() {
  return (
    <RoleEntry requiredRole="ADMIN">
      <AccountManagement />
    </RoleEntry>
  );
}