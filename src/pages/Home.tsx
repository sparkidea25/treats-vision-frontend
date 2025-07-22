import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { LiveSection } from "@/components/LiveSection";
import { ReplaySection } from "@/components/ReplaySection";

function Home() {
  return (
    <div className="min-h-screen bg-lime-50 overflow-hidden border-l border-r border-black relative z-20">
      {/* Main content with borders */}
      <div className="relative z-20 min-h-screen bg-lime-50 overflow-hidden border-l border-r border-black">

        {/* Vertical lines inside the bordered container */}
        <div className="absolute inset-y-0 left-6 w-px bg-black z-10"></div>
        <div className="absolute inset-y-0 right-6 w-px bg-black z-10"></div>

                {/* <div className=""> */}
            {/* <header className="sticky top-0 z-50 bg-lime-50 px-6 py-3 border-b border-black"> */}
             <div className="mx-6 border-b border-gray-800">
    {/* Content container with padding inside the border */}
    <div className="px-4">
      <Header />
    </div>
    </div>
              
            {/* </header> */}


        {/* Hero section with border */}
        {/* <div className="border border-dashed border-black shadow-lg h-80 w-90"> */}
       {/* <div className="border-b border-gray-800 mx-auto max-w-screen-xl">
  <HeroSection />
</div> */}

 {/* Content container with proper margins to stay within vertical lines */}
 <div className="mx-6 border-b border-gray-800">
    {/* Content container with padding inside the border */}
    <div className="px-4">
      <HeroSection />
    </div>
  </div>


        {/* Live section with border */}
         <div className="mx-6 border-b border-gray-800">
    {/* Content container with padding inside the border */}
      <div className="px-4">
          <LiveSection />
      </div>
    </div>

        {/* Replay section with border */}
                 <div className="mx-6 border-b border-gray-800">
    {/* Content container with padding inside the border */}
      <div className="px-4">
          <ReplaySection />
        </div>
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