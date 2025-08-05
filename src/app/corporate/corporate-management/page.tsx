import RoleEntry from '@/components/RoleEntry';
import CorporateManagement from '@/components/CorporateManagement';

export default function CorporateCorporateManagementPage() {
  return (
    <RoleEntry requiredRole="CORPORATE_CONTACT">
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <CorporateManagement />
        </div>
      </div>
    </RoleEntry>
  );
}