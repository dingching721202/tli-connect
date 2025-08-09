import UserProfile from '@/components/UserProfile';
import Navigation from '@/components/Navigation';

export default function ProfilePage() {
  return (
    <div className="main-layout">
      <Navigation />
      <UserProfile />
    </div>
  );
}