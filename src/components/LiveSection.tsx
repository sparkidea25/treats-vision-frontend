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
      <section className="bg-lime-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-gray-800 text-8xl font-normal font-Redaction">live</h2>
          </div>
          <div className="text-center text-gray-500 text-xl py-12">Loading...</div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-lime-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-gray-800 text-8xl font-normal font-Redaction">live</h2>
        </div>
        {fetchError || liveStreams.length === 0 ? (
          <div className="text-center text-gray-500 text-xl py-12">
            No live streams available
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
            <div className="absolute inset-y-0 left-0 w-px bg-black z-10"></div>
            <div className="absolute inset-y-0 right-0 w-px bg-black z-10"></div>
            {liveStreams.slice(0, 2).map((stream) => (
              <div
                key={stream.id}
                onClick={() =>
                  handleStreamClick(stream.streamPlaybackId, stream.terminate || false)
                }
                className="cursor-pointer"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleStreamClick(stream.streamPlaybackId, stream.terminate || false);
                  }
                }}
              >
                <LiveStreamCard
                  title={
                    stream.terminate
                      ? 'LIVE ENDED'
                      : stream.name || stream.title || 'Untitled Stream'
                  }
                  streamer={stream.username || 'Unknown Streamer'}
                  viewers={stream.viewers || 0}
                  isLive={!stream.terminate}
                  playbackId={stream.playbackId || stream.streamPlaybackId}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
