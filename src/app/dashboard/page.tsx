import Dashboard from '@/components/Dashboard';
import Navigation from '@/components/Navigation';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <Dashboard />
    </div>
  );
}