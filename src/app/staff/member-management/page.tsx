import RoleEntry from '@/components/RoleEntry';
import MemberManagement from '@/components/MemberManagement';

export default function StaffMemberManagementPage() {
  return (
    <RoleEntry requiredRole="STAFF">
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <MemberManagement />
        </div>
      </div>
    </RoleEntry>
  );
}