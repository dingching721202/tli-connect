import RoleEntry from '@/components/RoleEntry';
import AdminDashboard from '@/components/AdminDashboard';

export default function AdminDashboardPage() {
  return (
    <RoleEntry requiredRole="ADMIN">
      <AdminDashboard />
    </RoleEntry>
  );
}