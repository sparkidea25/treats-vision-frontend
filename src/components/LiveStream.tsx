
// import React, { useState } from 'react';
import { Eye } from 'lucide-react';

interface StreamCardProps {
  title: string;
  streamer: string;
  viewers: string;
  thumbnail: string;
  isLive?: boolean;
  playbackId?: string;
}

export const LiveStreamCard = ({ 
  title, 
  streamer, 
  viewers,
  isLive,  
}: StreamCardProps) => {
  return (
    <div 
      className="relative cursor-pointer group overflow-hidden"
    //   onClick={}
    >
      {/* Thumbnail/Video Container */}
      <div className="relative aspect-video bg-slate-800 overflow-hidden">
        {/* Dark atmospheric background with blue/teal lighting */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900"></div>
        
        {/* Atmospheric lighting effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl transform translate-x-8 -translate-y-8"></div>
        
        {/* Live indicator */}
        {isLive && (
          <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-sm">
            LIVE
          </div>
        )}
        
        {/* Viewer count */}
        <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1">
          <Eye className="w-3 h-3" />
          <span>{viewers} VIEWERS</span>
        </div>
        
        {/* Person with AR glasses */}
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Head silhouette */}
          <div className="relative">
            {/* Face/head area */}
            <div className="w-32 h-40 bg-gradient-to-b from-amber-200/80 to-amber-300/60 rounded-t-full relative">
              {/* AR glasses */}
              <div className="absolute top-12 left-1/2 transform -translate-x-1/2 w-20 h-6 bg-cyan-400/70 rounded-sm border border-cyan-300/80 backdrop-blur-sm">
                <div className="absolute inset-1 bg-cyan-300/30 rounded-sm"></div>
                {/* Bridge */}
                <div className="absolute top-1/2 left-1/2 w-2 h-1 bg-cyan-300/60 transform -translate-x-1/2 -translate-y-1/2"></div>
              </div>
              
              {/* Hair */}
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-28 h-16 bg-gradient-to-b from-amber-600/40 to-amber-400/30 rounded-t-full"></div>
            </div>
            
            {/* Neck/shoulders */}
            <div className="w-36 h-20 bg-gradient-to-b from-gray-300/60 to-gray-400/50 rounded-b-3xl -mt-4"></div>
          </div>
        </div>
        
        {/* Streamer avatar in bottom right */}
        <div className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-red-500 border-2 border-white p-0.5">
          <div className="w-full h-full rounded-full bg-orange-200"></div>
        </div>
      </div>
      
      {/* Stream Info */}
      <div className="p-4 bg-white">
        <h3 className="font-medium text-gray-900 text-sm mb-1">
          {title}
        </h3>
        <p className="text-gray-600 text-sm underline cursor-pointer hover:text-gray-800">
          {streamer}
        </p>
      </div>
    </div>
  );
};

// export const LiveStreamCard = ({ 
//   title, 
//   streamer, 
//   viewers,
//   isLive,  
// }: StreamCardProps) => {
//   return (
//     <div 
//       className="relative cursor-pointer group overflow-hidden rounded-lg bg-gray-900"
//     //   onClick={onClick}
//     >
//       {/* Thumbnail/Video Container */}
//       <div className="relative aspect-video bg-gradient-to-br from-blue-900 via-purple-800 to-pink-700">
//         {/* Mock video background with futuristic overlay */}
//         <div className="absolute inset-0 bg-black/40"></div>
        
//         {/* Live indicator */}
//         {isLive && (
//           <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-sm">
//             LIVE
//           </div>
//         )}
        
//         {/* Viewer count */}
//         <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1">
//           <Eye className="w-3 h-3" />
//           <span>{viewers} VIEWERS</span>
//         </div>
        
//         {/* Mock streamer image - futuristic person with AR glasses */}
//         <div className="absolute inset-0 flex items-center justify-center">
//           <div className="w-24 h-24 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center justify-center">
//             <div className="w-20 h-20 rounded-full bg-gray-800 flex items-center justify-center">
//               <div className="w-16 h-12 bg-cyan-300/30 rounded-lg border border-cyan-300/50"></div>
//             </div>
//           </div>
//         </div>
        
//         {/* Streamer avatar in bottom corner */}
//         <div className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-gradient-to-r from-orange-400 to-red-500 border-2 border-white flex items-center justify-center">
//           <div className="w-6 h-6 rounded-full bg-orange-300"></div>
//         </div>
//       </div>
      
//       {/* Stream Info */}
//       <div className="p-4 bg-white">
//         <h3 className="font-medium text-gray-900 text-sm mb-1 line-clamp-2">
//           {title}
//         </h3>
//         <p className="text-gray-600 text-sm underline cursor-pointer hover:text-gray-800">
//           {streamer}
//         </p>
//       </div>
//     </div>
//   );
// };
