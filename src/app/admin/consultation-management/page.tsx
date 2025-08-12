import RoleEntry from '@/components/RoleEntry';
import ConsultationManagementSimple from '@/components/ConsultationManagementSimple';

export default function AdminConsultationManagementPage() {
  return (
    <RoleEntry requiredRole="ADMIN">
      <ConsultationManagementSimple />
    </RoleEntry>
  );
}