import Navigation from "@/components/Navigation";
import BookingSystem from "@/components/BookingSystem";
import HeroSection from "@/components/HeroSection";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <HeroSection />
      <div id="booking">
        <BookingSystem />
      </div>
    </div>
  );
}
