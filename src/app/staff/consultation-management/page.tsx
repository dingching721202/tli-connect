import RoleEntry from '@/components/RoleEntry';
import ConsultationManagement from '@/components/ConsultationManagement';

export default function StaffConsultationManagementPage() {
  return (
    <RoleEntry requiredRole="STAFF">
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <ConsultationManagement />
        </div>
      </div>
    </RoleEntry>
  );
}