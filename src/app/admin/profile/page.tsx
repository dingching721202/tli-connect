import RoleEntry from '@/components/RoleEntry';
import UserProfile from '@/components/UserProfile';

export default function AdminProfilePage() {
  return (
    <RoleEntry requiredRole="ADMIN">
      <div className="min-h-screen bg-gray-50">
        <UserProfile />
      </div>
    </RoleEntry>
  );
}