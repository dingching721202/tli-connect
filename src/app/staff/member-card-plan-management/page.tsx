import RoleEntry from '@/components/RoleEntry';
import MemberCardPlanManagement from '@/components/MemberCardPlanManagement';

export default function StaffMemberCardPlanManagementPage() {
  return (
    <RoleEntry requiredRole="STAFF">
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <MemberCardPlanManagement />
        </div>
      </div>
    </RoleEntry>
  );
}