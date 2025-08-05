import RoleEntry from '@/components/RoleEntry';
import Dashboard from '@/components/Dashboard';

export default function TeacherDashboardPage() {
  return (
    <RoleEntry requiredRole="TEACHER">
      <Dashboard />
    </RoleEntry>
  );
}