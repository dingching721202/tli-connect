import RoleEntry from '@/components/RoleEntry';
import TeacherManagement from '@/components/TeacherManagement';

export default function StaffTeacherManagementPage() {
  return (
    <RoleEntry requiredRole="STAFF">
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <TeacherManagement />
        </div>
      </div>
    </RoleEntry>
  );
}