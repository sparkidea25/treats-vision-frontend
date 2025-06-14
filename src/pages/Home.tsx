
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { LiveSection } from "@/components/LiveSection";
import { ReplaySection } from "@/components/ReplaySection";

function Home() {
  return (
    <div className="min-h-screen bg-gray-900">
      <div className="min-h-screen bg-green-50 overflow-hidden">
        {/* Top border line */}
        <div className="border-b border-gray-800">
          <Header />
        </div>
        
        {/* Hero section with border */}
        <div className="border-b border-gray-800">
          <HeroSection />
        </div>
        
        {/* Live section with border */}
        <div className="border-b border-gray-800">
          <LiveSection />
        </div>
        
        {/* Replay section with border */}
        <div className="border-b border-gray-800">
          <ReplaySection />
        </div>
        
        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}

export default Home;