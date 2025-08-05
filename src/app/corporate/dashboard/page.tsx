import RoleEntry from '@/components/RoleEntry';
import Dashboard from '@/components/Dashboard';

export default function CorporateDashboardPage() {
  return (
    <RoleEntry requiredRole="CORPORATE_CONTACT">
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <Dashboard />
        </div>
      </div>
    </RoleEntry>
  );
}