import RoleEntry from '@/components/RoleEntry';
import Dashboard from '@/components/Dashboard';

export default function CorporateDashboardPage() {
  return (
    <RoleEntry requiredRole="CORPORATE_CONTACT">
      <Dashboard />
    </RoleEntry>
  );
}