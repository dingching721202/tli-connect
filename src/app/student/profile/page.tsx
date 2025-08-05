import RoleEntry from '@/components/RoleEntry';
import UserProfile from '@/components/UserProfile';

export default function StudentProfilePage() {
  return (
    <RoleEntry requiredRole="STUDENT">
      <UserProfile />
    </RoleEntry>
  );
}