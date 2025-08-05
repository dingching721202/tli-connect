import RoleEntry from '@/components/RoleEntry';
import LeaveManagement from '@/components/LeaveManagement';

export default function StaffLeaveManagementPage() {
  return (
    <RoleEntry requiredRole="STAFF">
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <LeaveManagement />
        </div>
      </div>
    </RoleEntry>
  );
}