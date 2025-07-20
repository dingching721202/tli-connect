import CourseManagement from '@/components/CourseManagement';
import Navigation from '@/components/Navigation';

export default function CourseManagementPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <CourseManagement />
      </div>
    </div>
  );
}