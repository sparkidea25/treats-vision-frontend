import { useEffect, useState } from 'react';
// import * as Player from "@livepeer/react/player";
// import { PauseIcon, PlayIcon } from '@livepeer/react/assets';
// import { getSrc } from '@livepeer/react/external';
import { ApiStrings } from '@/lib/apiStrings';
import { StreamCard } from './StreamCard';

export function ReplaySection() {
      const [srcList, setSrcList] = useState<any[]>([]);
      const fetchReplays = async () => {
    try {
      const response = await fetch(`${process.env.VITE_API_LINK}/v1.0/livepeer/playbacks`);
      if (!response.ok) {
        throw new Error('Network response was not ok'); 
      }
      const replays = await response.json();
      console.log(replays, 'Fetched replay streams');
      return replays;
    } catch(error) {
      console.error('Error fetching replay streams:', error);
    }
  };

  // src/utils/livepeer.ts
 const syncThumbnail = async(streamPlaybackId: string) => {
  try {
    /* 1️⃣  Grab the current thumbnail for this playback */
    const metaRes = await fetch(
      `${ApiStrings.API_BASE_URL}/livepeer/${streamPlaybackId}`,
    );
    if (!metaRes.ok) throw new Error('Could not fetch thumbnail metadata');

    // Expected shape: { streamPlaybackId: string; thumbnailUrl: string; … }
    const { thumbnailUrl } = await metaRes.json();
    if (!thumbnailUrl)
      throw new Error(`No thumbnail returned for ${streamPlaybackId}`);

    /* 2️⃣  Save it (or trigger any other side‑effects) */
    const saveRes = await fetch(
      `${ApiStrings.API_BASE_URL}/livepeer/update-thumbnail/`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ streamPlaybackId, thumbnailUrl }),
      },
    );
    if (!saveRes.ok) throw new Error('Failed to update thumbnail');

    /* optional: return whatever the update route echoes back */
    return await saveRes.json();
  } catch (err) {
    console.error(`syncThumbnail(${streamPlaybackId}) →`, err);
    throw err; // let callers decide how to handle failures
  }
}

useEffect(() => {
  (async () => {
    try {
      const replays = await fetchReplays();  // already implemented
      const safeReplays = Array.isArray(replays) ? replays : [];
      setSrcList(safeReplays);                   // show immediately

      // Only proceed if there are items to process
      if (safeReplays.length > 0) {
        // refresh thumbnails in parallel (max 5 at once)
        const limit = 5;
        for (let i = 0; i < safeReplays.length; i += limit) {
          const slice = safeReplays.slice(i, i + limit);
          await Promise.allSettled(
            slice.map(r => syncThumbnail(r.streamPlaybackId)),
          );
        }
        // pull the updated list if you want the brand‑new URLs
        // const fresh = await fetchReplays();
        // setSrcList(fresh);
      }
    } catch (e) {
      console.error('Batch thumbnail sync failed', e);
    }
  })();
}, []);
 
  //   try {
  //     const res = await fetch(`${ApiStrings.API_BASE_URL}/livepeer/playbacks`);
  //     const data = await res.json();
  //     const playbackIds = Array.isArray(data) ? data.map(item => item.streamPlaybackId) : [];
  //     const title = Array.isArray(data) ? data.map(item => item.name) : [];
  //     const description = Array.isArray(data) ? data.map(item => item.description) : [];
  //     console.log(title, description, 'title and descriptions')
  //     if (playbackIds.length === 0) return;

  //     // Fetch all playback info in parallel, but only keep 'image' type from getSrc
  //     const playbackImages = await Promise.all(
  //       playbackIds.map(async (id) => {
  //         const playbackInfoRes = await fetch(`${ApiStrings.API_BASE_URL}/livepeer/${id}`);
  //         const playbackInfo = await playbackInfoRes.json();
  //         console.log(playbackInfo, 'check for title and description');
  //         // getSrc returns an array of objects (hls, webrtc, image, etc)
  //         const srcArr = getSrc(playbackInfo.playbackInfo);
  //         console.log(srcArr, 'srcArr')
  //         // Only return the 'image' type object(s)
  //         return (srcArr ?? []).filter(src => src.type === 'image');
  //       })
  //     );
  //     // Flatten the array of arrays into a single array
  //     const flatImageList = playbackImages.flat();
  //     console.log(flatImageList, 'check playback images');
  //     setSrcList(flatImageList);
  //   } catch (err) {
  //     console.error('Failed to fetch playbacks', err);
  //   }
  // }
  // fetchPlaybacks();
// }, []);

console.log(srcList, 'src List')

  return (
    <section className="bg-lime-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-gray-800 text-8xl font-Redaction">replay</h2>
        </div>
        {srcList.length === 0 ? (
          <div className="text-center text-gray-500 text-xl py-12">No replay available</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {srcList
              .filter((src) => src.type === 'image')
              .map((src, idx) => {
                // Find the image thumbnail for this stream, if available
                const image = srcList.find((item) => item.type === 'image' && item.playbackId === src.playbackId);
                // You may want to store more metadata per stream in the backend for real use
                return (
                  <div
                    key={src.playbackId || idx}
                    onClick={() => {
                      window.location.href = `/stream/${src.playbackId}`;
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    <StreamCard
                      title={src.name || src.title}
                      streamer={src.streamPlaybackId || ''}
                      viewers={''}
                      thumbnail={image ? image.src : ''}
                    >
                      {/* Optionally, you can show a preview player here, or just the thumbnail */}
                    </StreamCard>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </section>
  );
}