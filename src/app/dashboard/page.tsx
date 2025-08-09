import Dashboard from '@/components/Dashboard';
import Navigation from '@/components/Navigation';

export default function DashboardPage() {
  return (
    <div className="main-layout">
      <Navigation />
      <div className="page-container">
        <Dashboard />
      </div>
    </div>
  );
}