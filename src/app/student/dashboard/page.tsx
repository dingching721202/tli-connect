import RoleEntry from '@/components/RoleEntry';
import Dashboard from '@/components/Dashboard';

export default function StudentDashboardPage() {
  return (
    <RoleEntry requiredRole="STUDENT">
      <Dashboard />
    </RoleEntry>
  );
}