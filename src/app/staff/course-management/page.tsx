import RoleEntry from '@/components/RoleEntry';
import CourseManagement from '@/components/CourseManagement';

export default function StaffCourseManagementPage() {
  return (
    <RoleEntry requiredRole="STAFF">
      <div className="min-h-screen bg-gray-50">
        <div className="px-4 py-8">
          <CourseManagement />
        </div>
      </div>
    </RoleEntry>
  );
}