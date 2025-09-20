import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiStrings } from '@/lib/apiStrings';
import { LiveStreamCard } from './LiveStream';
import { fetchUsername } from '@/lib/utils';

export function ReplaySection() {
  const [srcList, setSrcList] = useState<any[]>([]);
  const navigate = useNavigate();

  const fetchReplays = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_LINK}/livepeer/playbacks`,
        {
          // method: 'GET',
          headers: {
            'content-type': 'application/json',
            'ngrok-skip-browser-warning': 'true',
            'Access-Control-Allow-Origin': '*',
          },
        },
      );
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const replays = await response.json();
      console.log(replays, 'Fetched replay streams');
      return replays;
    } catch (error) {
      console.error('Error fetching replay streams:', error);
    }
  };

  const syncThumbnail = async (streamPlaybackId: string) => {
    try {
      const metaRes = await fetch(
        `${ApiStrings.API_BASE_URL}/livepeer/${streamPlaybackId}`,
        {
          method: 'GET',
          headers: {
            contentType: 'application/json',
            'ngrok-skip-browser-warning': 'true',
          },
        },
      );
      if (!metaRes.ok) throw new Error('Could not fetch thumbnail metadata');

      const { thumbnailUrl } = await metaRes.json();
      if (!thumbnailUrl)
        throw new Error(`No thumbnail returned for ${streamPlaybackId}`);

      const saveRes = await fetch(
        `${ApiStrings.API_BASE_URL}/livepeer/update-thumbnail/`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ streamPlaybackId, thumbnailUrl }),
        },
      );
      if (!saveRes.ok) throw new Error('Failed to update thumbnail');

      return await saveRes.json();
    } catch (err) {
      console.error(`syncThumbnail(${streamPlaybackId}) →`, err);
      throw err;
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const replays = await fetchReplays();
        const safeReplays = Array.isArray(replays) ? replays : [];

        // 🔹 enrich with usernames
        const enrichedReplays = await Promise.all(
          safeReplays.map(async (r) => {
            const username = r.userPrivyId
              ? await fetchUsername(r.userPrivyId)
              : 'Unknown Streamer';
            return { ...r, streamName: username };
          }),
        );

        setSrcList(enrichedReplays);

        if (enrichedReplays.length > 0) {
          const limit = 5;
          for (let i = 0; i < enrichedReplays.length; i += limit) {
            const slice = enrichedReplays.slice(i, i + limit);
            await Promise.allSettled(
              slice.map((r) => syncThumbnail(r.streamPlaybackId)),
            );
          }
        }
      } catch (e) {
        console.error('Batch thumbnail sync failed', e);
      }
    })();
  }, []);

  const handleReplayClick = (playbackId: string) => {
    navigate(`/player/${playbackId}`);
  };

  return (
    <section className="bg-lime-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-gray-800 text-8xl font-Redaction">replay</h2>
        </div>
        {srcList.length === 0 ? (
          <div className="text-center text-gray-500 text-xl py-12">
            No replay available
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {srcList.map((replay, idx) => (
              <div
                key={replay.streamPlaybackId || idx}
                onClick={() => handleReplayClick(replay.streamPlaybackId)}
                style={{ cursor: 'pointer' }}
              >
                <LiveStreamCard
                  title={replay.name || replay.title || 'Untitled Stream'}
                  streamer={replay.streamName || 'Unknown Streamer'}
                  viewers={0}
                  isLive={false}
                  playbackId={replay.streamPlaybackId}
                  isEnded={true}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}