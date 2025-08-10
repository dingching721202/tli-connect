import RoleEntry from '@/components/RoleEntry';
import ConsultationManagement from '@/components/ConsultationManagement';

export default function AdminConsultationManagementPage() {
  return (
    <RoleEntry requiredRole="ADMIN">
      <ConsultationManagement />
    </RoleEntry>
  );
}