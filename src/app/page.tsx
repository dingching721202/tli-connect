import Navigation from "@/components/Navigation";
import BookingSystem from "@/components/BookingSystem";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <BookingSystem />
    </div>
  );
}
