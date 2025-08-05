import RoleEntry from '@/components/RoleEntry';
import AgentManagement from '@/components/AgentManagement';

export default function StaffAgentManagementPage() {
  return (
    <RoleEntry requiredRole="STAFF">
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <AgentManagement />
        </div>
      </div>
    </RoleEntry>
  );
}