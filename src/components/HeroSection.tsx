import { Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

export function HeroSection() {
  return (
    <section className="bg-green-50 p-6">
      <div className="max-w-7xl mx-auto">
        <Link to="/stream" className="block group" tabIndex={-1}>
          <div className="relative rounded-lg overflow-hidden bg-black aspect-video border border-gray-800 cursor-pointer transition ring-rose-400/40 group-hover:ring-4">
            <img 
              src="/assets/herovideo.png"
              alt="Featured livestream"
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4 flex items-center space-x-1">
              <Eye className="w-4 h-4 text-white" />
              <span className="text-white text-sm">1.2k</span>
            </div>
            <div className="absolute top-4 right-4 flex items-center space-x-2 bg-black/50 rounded-md px-3 py-1">
              <Badge className="bg-rose-400 text-white text-xs px-2 py-1 rounded">
                LIVE
              </Badge> 
            </div>
            <div className="absolute bottom-4 left-4 right-4">
              <div className="text-black">
                <h2 className="text-xl font-semibold mb-1">Ernie's 24/7br Livestream</h2>
                <p className="text-black-300 text-sm">Exile</p>
              </div>
            </div>
          </div>
        </Link>
        
        {/* Bottom border for hero content */}
        <div className="border-t border-gray-800 mt-6 pt-4 text-center">
          <h3 className="text-gray-800 font-normal text-sm">Ernie's 24/7hr Livestream</h3>
          <p className="text-gray-600 text-xs">Ernie</p>
        </div>
      </div>
    </section>
  );
}