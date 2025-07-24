// import React, { useState } from 'react';
import { Eye, } from 'lucide-react';

interface LiveStreamCardProps {
  title: string;
  streamer: string;
  viewers: number;
  isLive: boolean;
  onClick: () => void;
}

export const LiveStreamCard = ({
  title,
  streamer,
  viewers,
  isLive,
  onClick,
}: LiveStreamCardProps) => {
  return (
    <div 
      className="relative cursor-pointer group overflow-hidden"
      onClick={onClick}
    >
      {/* Thumbnail/Video Container */}
      <div className="relative aspect-video bg-slate-900 overflow-hidden">
        {/* Dark atmospheric background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900"></div>
        
        {/* Blurred bokeh lights in background */}
        <div className="absolute top-1/4 right-1/4 w-4 h-4 bg-blue-400/60 rounded-full blur-sm"></div>
        <div className="absolute top-1/2 right-1/3 w-3 h-3 bg-cyan-300/40 rounded-full blur-sm"></div>
        <div className="absolute bottom-1/3 right-1/5 w-2 h-2 bg-white/30 rounded-full blur-sm"></div>
        <div className="absolute top-1/3 left-1/4 w-3 h-3 bg-purple-400/30 rounded-full blur-sm"></div>
        
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
        
        {/* Person with AR glasses - matching the real photo */}
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Person silhouette */}
          <div className="relative w-40 h-48">
            {/* Head and face */}
            <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-24 h-32 bg-gradient-to-b from-amber-200/90 to-amber-300/80 rounded-t-full relative overflow-hidden">
              
              {/* Hair - blonde/light brown */}
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-28 h-20 bg-gradient-to-b from-yellow-600/60 to-amber-500/50 rounded-t-full"></div>
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-26 h-16 bg-gradient-to-b from-amber-400/70 to-amber-300/60 rounded-t-full"></div>
              
              {/* AR glasses - translucent blue */}
              <div className="absolute top-10 left-1/2 transform -translate-x-1/2 w-20 h-8 bg-gradient-to-r from-cyan-400/70 via-blue-300/60 to-cyan-400/70 rounded-sm border border-cyan-200/80 backdrop-blur-sm">
                {/* Glass effect */}
                <div className="absolute inset-1 bg-gradient-to-r from-cyan-200/20 via-transparent to-cyan-200/20 rounded-sm"></div>
                <div className="absolute top-1 left-2 w-2 h-1 bg-white/40 rounded-full blur-sm"></div>
                <div className="absolute top-1 right-2 w-2 h-1 bg-white/40 rounded-full blur-sm"></div>
                
                {/* Bridge */}
                <div className="absolute top-1/2 left-1/2 w-2 h-1 bg-cyan-300/80 transform -translate-x-1/2 -translate-y-1/2"></div>
              </div>
              
              {/* Subtle face features */}
              <div className="absolute top-16 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-amber-600/40 rounded-full"></div>
              <div className="absolute top-20 left-1/2 transform -translate-x-1/2 w-3 h-1 bg-amber-600/30 rounded-full"></div>
            </div>
            
            {/* Neck and shoulders */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-32 h-16 bg-gradient-to-b from-gray-300/60 to-beige-200/50 rounded-b-3xl">
              {/* Clothing - light colored top */}
              <div className="w-full h-full bg-gradient-to-b from-gray-200/70 to-gray-300/60 rounded-b-3xl"></div>
            </div>
          </div>
        </div>
        
        {/* Streamer avatar in bottom right */}
        <div className="absolute bottom-3 right-3 w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-red-500 border-2 border-white p-1">
          <div className="w-full h-full rounded-full bg-gradient-to-br from-orange-200 to-yellow-200 flex items-center justify-center">
            <div className="w-6 h-6 rounded-full bg-orange-300"></div>
          </div>
        </div>
      </div>
      
      {/* Stream Info */}
      <div className="p-4 bg-lime-50 border border-gray-200">
        <h3 className="font-medium text-gray-900 text-sm mb-1 text-center">
          {title}
        </h3>
        <p className="text-gray-600 text-sm text-center underline cursor-pointer hover:text-gray-800">
          {streamer}
        </p>
      </div>
    </div>
  );
};