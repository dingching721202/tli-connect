import UserProfile from '@/components/UserProfile';
import Navigation from '@/components/Navigation';

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <UserProfile />
    </div>
  );
}