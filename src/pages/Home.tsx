import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { LiveSection } from "@/components/LiveSection";
import { ReplaySection } from "@/components/ReplaySection";

function Home() {
  return (
    <div className="min-h-screen bg-green-50 overflow-hidden border-l border-r border-black relative z-20">
      {/* Main content with borders */}
      <div className="relative z-20 min-h-screen bg-green-50 overflow-hidden border-l border-r border-black">

        {/* Vertical lines inside the bordered container */}
        <div className="absolute inset-y-0 left-6 w-px bg-black z-10"></div>
        <div className="absolute inset-y-0 right-6 w-px bg-black z-10"></div>

                {/* <div className=""> */}
            {/* <header className="sticky top-0 z-50 bg-green-50 px-6 py-3 border-b border-black"> */}
              <Header />
            {/* </header> */}


        {/* Hero section with border */}
        <div className="border-b border-gray-800">
          <HeroSection />
        </div>

        {/* Live section with border */}
        <div className="border-b border-gray-800">
          <LiveSection />
        </div>

        {/* Replay section with border */}
        <div className="border-b border-gray-800 pb-12">
          <ReplaySection />
        </div>

        {/* <br /> */}

        {/* <div className="relative"> */}
          {/* <div className="absolute inset-y-0 left-6 w-px bg-black z-10"></div> */}
          {/* <div className="absolute inset-y-0 right-6 w-px bg-black z-10"></div> */}
          <Footer />
        {/* </div> */}
      </div>
    </div>
  );
}


export default Home;