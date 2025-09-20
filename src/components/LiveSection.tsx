import { useEffect, useState } from 'react';
import { ApiStrings } from '@/lib/apiStrings';
import { useNavigate } from 'react-router-dom';
import { LiveStreamCard } from './LiveStream';
import { fetchUsername } from '@/lib/utils';

// Define the stream data structure
interface StreamData {
  id: string;
  name?: string;
  title?: string;
  streamer: string;
  viewers: number;
  streamPlaybackId: string;
  playbackId: string;
  terminate?: boolean;
  userPrivyId?: string;
  username?: string;
}

interface LiveSectionProps {
  navVariant?: 'default' | '/';
  currentStreamId?: string;
}

export function LiveSection({ navVariant, currentStreamId }: LiveSectionProps) {
  const navigate = useNavigate();
  const [liveStreams, setLiveStreams] = useState<StreamData[]>([]);
  const [fetchError, setFetchError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  console.log(currentStreamId, navVariant, 'currentStreamId in LiveSection');

  // Fetch streams
  const fetchIhrStreams = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${ApiStrings.API_BASE_URL}/livepeer/1hr-playback`, {
        headers: {
          'content-type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
          'Access-Control-Allow-Origin': '*',
        },
      });
      if (!response.ok) throw new Error('Network response was not ok');
      const data: StreamData[] = await response.json();
      setLiveStreams(data);
      setFetchError(false);
    } catch (error) {
      setFetchError(true);
      setLiveStreams([]);
      console.error('Error fetching 1hr playback streams:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIhrStreams();
  }, []);

  useEffect(() => {
    const enrichWithUsernames = async () => {
      if (!liveStreams.length) return;

      const updatedStreams = await Promise.all(
        liveStreams.map(async (stream) => {
          if (stream.userPrivyId) {
            try {
              const uname = await fetchUsername(stream.userPrivyId);
              return { ...stream, username: uname };
            } catch (err) {
              console.error(`Failed to fetch username for ${stream.userPrivyId}`, err);
              return { ...stream, username: 'Unknown Streamer' };
            }
          }
          return { ...stream, username: 'Unknown Streamer' };
        })
      );

      setLiveStreams(updatedStreams);
    };

    enrichWithUsernames();
  }, [liveStreams.length]);

  const handleStreamClick = (streamPlaybackId: string, isTerminated: boolean) => {
    console.log('Stream clicked:', streamPlaybackId, 'Terminated:', isTerminated);
    navigate(`/player/${streamPlaybackId}`);
  };

if (isLoading) {
  return (
    <section className="bg-lime-50 p-6 border-t border-b border-black">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-gray-800 text-8xl font-normal font-Redaction">live</h2>
        </div>
        <div className="text-center text-gray-500 text-xl py-12">Loading...</div>
      </div>
    </section>
  );
}

return (
  <section className="bg-lime-50 p-6 border-t border-b border-black">
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-gray-800 text-8xl font-normal font-Redaction">live</h2>
      </div>
      {fetchError || liveStreams.length === 0 ? (
        <div className="text-center text-gray-500 text-xl py-12">
          No live streams available
        </div>
      ) : (
        <div className="relative">
          {/* Main container with edge positioning */}
          <div className="flex justify-between items-start gap-8">
            {/* Left stream */}
            <div className="flex-1 border-l border-black pl-6 relative">
              {liveStreams[0] && (
                <div
                  onClick={() =>
                    handleStreamClick(liveStreams[0].streamPlaybackId, liveStreams[0].terminate || false)
                  }
                  className="cursor-pointer"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleStreamClick(liveStreams[0].streamPlaybackId, liveStreams[0].terminate || false);
                    }
                  }}
                >
                  <LiveStreamCard
                    title={
                      liveStreams[0].terminate
                        ? 'LIVE ENDED'
                        : liveStreams[0].name || liveStreams[0].title || 'Untitled Stream'
                    }
                    streamer={liveStreams[0].username || 'Unknown Streamer'}
                    viewers={liveStreams[0].viewers || 0}
                    isLive={!liveStreams[0].terminate}
                    playbackId={liveStreams[0].playbackId || liveStreams[0].streamPlaybackId}
                  />
                </div>
              )}
            </div>

            {/* Right stream */}
            <div className="flex-1 border-r border-black pr-6 relative">
              {liveStreams[1] && (
                <div
                  onClick={() =>
                    handleStreamClick(liveStreams[1].streamPlaybackId, liveStreams[1].terminate || false)
                  }
                  className="cursor-pointer"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleStreamClick(liveStreams[1].streamPlaybackId, liveStreams[1].terminate || false);
                    }
                  }}
                >
                  <LiveStreamCard
                    title={
                      liveStreams[1].terminate
                        ? 'LIVE ENDED'
                        : liveStreams[1].name || liveStreams[1].title || 'Untitled Stream'
                    }
                    streamer={liveStreams[1].username}
                    viewers={liveStreams[1].viewers || 0}
                    isLive={!liveStreams[1].terminate}
                    playbackId={liveStreams[1].playbackId || liveStreams[1].streamPlaybackId}
                  />
                </div>
              )}
            </div>
          </div>
          
          {/* Center dividing line */}
          <div className="absolute inset-y-0 left-1/2 w-px bg-black transform -translate-x-0.5"></div>
        </div>
      )}
    </div>
  </section>
);
}
