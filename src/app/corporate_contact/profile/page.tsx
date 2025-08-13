import RoleEntry from '@/components/RoleEntry';
import UserProfile from '@/components/UserProfile';

export default function CorporateProfilePage() {
  return (
    <RoleEntry requiredRole="CORPORATE_CONTACT">
      <UserProfile />
    </RoleEntry>
  );
}