import RoleEntry from '@/components/RoleEntry';
import Dashboard from '@/components/Dashboard';

export default function StaffDashboardPage() {
  return (
    <RoleEntry requiredRole="STAFF">
      <Dashboard />
    </RoleEntry>
  );
}