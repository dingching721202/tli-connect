import RoleEntry from '@/components/RoleEntry';
import UserProfile from '@/components/UserProfile';

export default function TeacherProfilePage() {
  return (
    <RoleEntry requiredRole="TEACHER">
      <div className="min-h-screen bg-gray-50">
        <UserProfile />
      </div>
    </RoleEntry>
  );
}