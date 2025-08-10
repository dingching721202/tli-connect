import RoleEntry from '@/components/RoleEntry';
import TeacherManagement from '@/components/TeacherManagement';

export default function AdminTeacherManagementPage() {
  return (
    <RoleEntry requiredRole="ADMIN">
      <TeacherManagement />
    </RoleEntry>
  );
}