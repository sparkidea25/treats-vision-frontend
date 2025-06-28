import { useEffect, useState } from 'react';
// import { StreamCard } from './StreamCard';
// import { Livepeer } from 'livepeer';
// import { getSrc } from '@livepeer/react/external';
import * as Player from "@livepeer/react/player";
import { PauseIcon, PlayIcon } from '@livepeer/react/assets';
// import { Src } from "@livepeer/react";
import { getSrc } from '@livepeer/react/external';
import { ApiStrings } from '@/lib/apiStrings';

export function ReplaySection() {
      // Accept array of objects for srcList
      const [srcList, setSrcList] = useState<any[]>([]);
  // const replayStreams = [
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
      if (playbackIds.length === 0) return;

      // Fetch all playback info in parallel
      const playbackInfos = await Promise.all(
        playbackIds.map(async (id) => {
          const playbackInfoRes = await fetch(`${ApiStrings.API_BASE_URL}/livepeer/${id}`);
          const playbackInfo = await playbackInfoRes.json();
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
          {/* {replayStreams.map((stream, index) => (
            <StreamCard
              key={index}
              {...stream}
              isLive={true}
            />
          ))} */}
           <Player.Root src={srcList}>
      <Player.Container>
        {/* Use the first image type in srcList as the poster thumbnail, if available */}
        <Player.Video
          title="Live stream"
          poster={Array.isArray(srcList) ? (srcList.find((item) => item && item.type === 'image')?.src) : undefined}
        />

        <Player.Controls className="flex items-center justify-center">
          <Player.PlayPauseTrigger className="w-10 h-10">
            <Player.PlayingIndicator asChild matcher={false}>
              <PlayIcon />
            </Player.PlayingIndicator>
            <Player.PlayingIndicator asChild>
              <PauseIcon />
            </Player.PlayingIndicator>
          </Player.PlayPauseTrigger>
        </Player.Controls>
      </Player.Container>
    </Player.Root>
        </div>
      </div>
    </section>
  );
}