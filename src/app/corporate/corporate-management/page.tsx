import RoleEntry from '@/components/RoleEntry';
import CorporateMemberManagement from '@/components/CorporateMemberManagement';

export default function CorporateCorporateManagementPage() {
  return (
    <RoleEntry requiredRole="CORPORATE_CONTACT">
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <CorporateMemberManagement />
        </div>
      </div>
    </RoleEntry>
  );
}