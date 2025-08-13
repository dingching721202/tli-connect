import RoleEntry from '@/components/RoleEntry';
import Dashboard from '@/components/Dashboard';

export default function AdminDashboardPage() {
  return (
    <RoleEntry requiredRole="ADMIN">
      <Dashboard />
    </RoleEntry>
  );
}