import RoleEntry from '@/components/RoleEntry';
import Dashboard from '@/components/Dashboard';

export default function AgentDashboardPage() {
  return (
    <RoleEntry requiredRole="AGENT">
      <Dashboard />
    </RoleEntry>
  );
}