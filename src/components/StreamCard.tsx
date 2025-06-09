import { Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface StreamCardProps {
  title: string;
  streamer: string;
  viewers: string;
  thumbnail: string;
  isLive?: boolean;
}

export function StreamCard({ title, streamer, viewers, thumbnail, isLive = false }: StreamCardProps) {
  return (
    <div className="bg-green border border-gray-800 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
      <div className="relative aspect-video">
        <img 
          src={thumbnail}
          alt={title}
          className="w-full h-full object-cover"
        />
        {/* Eye icon and viewers on the left */}
        <div className="absolute top-2 left-2 flex items-center space-x-1 bg-black/50 rounded px-2 py-1">
          <Eye className="w-3 h-3 text-white" />
          <span className="text-white text-xs">{viewers}</span>
        </div>
        {/* LIVE badge on the right */}
        {isLive && (
          <div className="absolute top-2 right-2">
            <Badge className="bg-rose-400 text-white text-xs px-2 py-1 rounded">
              LIVE
            </Badge>
          </div>
        )}
      </div>
      <div className="p-3 text-center border-t border-gray-800">
        <h3 className="text-gray-800 font-normal text-sm mb-1">{title}</h3>
        <p className="text-gray-600 text-xs">{streamer}</p>
      </div>
    </div>
  );
}