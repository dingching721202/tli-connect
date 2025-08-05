import RoleEntry from '@/components/RoleEntry';
import CourseManagement from '@/components/CourseManagement';

export default function AdminCourseManagementPage() {
  return (
    <RoleEntry requiredRole="ADMIN">
      <CourseManagement />
    </RoleEntry>
  );
}