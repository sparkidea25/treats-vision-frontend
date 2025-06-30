import { useEffect, useState } from 'react';
// import * as Player from "@livepeer/react/player";
// import { PauseIcon, PlayIcon } from '@livepeer/react/assets';
import { getSrc } from '@livepeer/react/external';
import { ApiStrings } from '@/lib/apiStrings';
import { StreamCard } from './StreamCard';

export function ReplaySection() {
      const [srcList, setSrcList] = useState<any[]>([]);
  //   {
  //     title: "Ernie's 24/7br Livestream",
  //     streamer: "Exile", 
  //     viewers: "500",
  //     thumbnail: "https://images.pexels.com/photos/7688374/pexels-photo-7688374.jpeg?auto=compress&cs=tinysrgb&w=400",
  //   },
  //   {
  //     title: "Ernie's 24/7br Livestream",
  //     streamer: "Exile",
  //     viewers: "823", 
  //     thumbnail: "https://images.pexels.com/photos/7688374/pexels-photo-7688374.jpeg?auto=compress&cs=tinysrgb&w=400",
  //   },
  //   {
  //     title: "Ernie's 24/7br Livestream",
  //     streamer: "Exile",
  //     viewers: "1.1k",
  //     thumbnail: "https://images.pexels.com/photos/7688374/pexels-photo-7688374.jpeg?auto=compress&cs=tinysrgb&w=400",
  //   },
  //   {
  //     title: "Ernie's 24/7br Livestream", 
  //     streamer: "Exile",
  //     viewers: "967",
  //     thumbnail: "https://images.pexels.com/photos/7688374/pexels-photo-7688374.jpeg?auto=compress&cs=tinysrgb&w=400",
  //   },
  //   {
  //     title: "Ernie's 24/7br Livestream",
  //     streamer: "Exile", 
  //     viewers: "445",
  //     thumbnail: "https://images.pexels.com/photos/7688374/pexels-photo-7688374.jpeg?auto=compress&cs=tinysrgb&w=400",
  //   },
  //   {
  //     title: "Ernie's 24/7br Livestream",
  //     streamer: "Exile",
  //     viewers: "712",
  //     thumbnail: "https://images.pexels.com/photos/7688374/pexels-photo-7688374.jpeg?auto=compress&cs=tinysrgb&w=400",
  //   }
  // ];

  //add effect to call https://e5bb-102-89-75-69.ngrok-free.app/v1.0/livepeer/playbacks get the list of playbackIds
  // then pass each response to playback.get
  // then set src to setSrc, it should be a string
useEffect(() => {
  async function fetchPlaybacks() {
    try {
      const res = await fetch(`${ApiStrings.API_BASE_URL}/livepeer/playbacks`);
      const data = await res.json();
      const playbackIds = Array.isArray(data) ? data.map(item => item.streamPlaybackId) : [];
      const title = Array.isArray(data) ? data.map(item => item.name) : [];
      const description = Array.isArray(data) ? data.map(item => item.description) : [];
      console.log(title, description, 'title and descriptions')
      if (playbackIds.length === 0) return;

      // Fetch all playback info in parallel
      const playbackInfos = await Promise.all(
        playbackIds.map(async (id) => {
          const playbackInfoRes = await fetch(`${ApiStrings.API_BASE_URL}/livepeer/${id}`);
          const playbackInfo = await playbackInfoRes.json();
          console.log(playbackInfo, 'check for title and description')
          // getSrc returns an array of objects (hls, webrtc, image, etc)
          const srcArr = getSrc(playbackInfo.playbackInfo);
          return srcArr;
        })
      );
      // Flatten the array of arrays into a single array
      const flatSrcList = playbackInfos.flat();
      console.log(flatSrcList, 'check playback infoes');
      setSrcList(flatSrcList);
    } catch (err) {
      console.error('Failed to fetch playbacks', err);
    }
  }
  fetchPlaybacks();
}, []);

console.log(srcList, 'src List')

  return (
    <section className="bg-green-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-gray-800 text-6xl font-light">replay</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {srcList
            .filter((src) => src.type === 'hls' || src.type === 'webrtc')
            .map((src, idx) => {
              // Find the image thumbnail for this stream, if available
              const image = srcList.find((item) => item.type === 'image' && item.playbackId === src.playbackId);
              // You may want to store more metadata per stream in the backend for real use
              return (
                <StreamCard
                  key={src.playbackId || idx}
                  title={`Replay #${idx + 1}`}
                  streamer={src.playbackId || ''}
                  viewers={''}
                  thumbnail={image ? image.src : ''}
                  onClick={() => {
                    window.location.href = `/stream/${src.playbackId}`;
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Optionally, you can show a preview player here, or just the thumbnail */}
                </StreamCard>
              );
            })}
        </div>
      </div>
    </section>
  );
}