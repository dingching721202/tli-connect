import RoleEntry from '@/components/RoleEntry';
import UserProfile from '@/components/UserProfile';

export default function StaffProfilePage() {
  return (
    <RoleEntry requiredRole="STAFF">
      <UserProfile />
    </RoleEntry>
  );
}