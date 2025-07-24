import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { LiveSection } from "@/components/LiveSection";
import { ReplaySection } from "@/components/ReplaySection";

function Home() {
  return (
    <div className="min-h-screen bg-lime-50 overflow-hidden border-l border-r border-black relative z-20">
  {/* Vertical lines inside the bordered container */}
  <div className="absolute inset-y-0 left-6 w-px bg-black z-10"></div>
  <div className="absolute inset-y-0 right-6 w-px bg-black z-10"></div>

  {/* Header */}
  <div className="mx-6 border-b border-gray-800">
    <div className="px-4">
      <Header />
    </div>
  </div>

  {/* Hero Section */}
  <div className="mx-6 border-b border-gray-800">
    <div className="px-4">
      <HeroSection />
    </div>
  </div>

  {/* Live Section */}
  <div className="mx-6 border-b border-gray-800">
    <div className="px-4">
      <LiveSection />
    </div>
  </div>

  {/* Replay Section */}
  <div className="mx-6 border-b border-gray-800">
    <div className="px-4">
      <ReplaySection />
    </div>
  </div>

  {/* Footer */}
  <div className="mx-6 border-b border-gray-800">
    <div className="px-4">
      <Footer />
    </div>
  </div>
</div>

  );
}


export default Home;