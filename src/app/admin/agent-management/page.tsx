import RoleEntry from '@/components/RoleEntry';
import AgentManagement from '@/components/AgentManagement';

export default function AdminAgentManagementPage() {
  return (
    <RoleEntry requiredRole="ADMIN">
      <AgentManagement />
    </RoleEntry>
  );
}