import { useEffect, useState } from 'react';
import { StreamCard } from './StreamCard';
import { ApiStrings } from '@/lib/apiStrings';
import { useNavigate } from 'react-router-dom';

// type LiveStream = {
//   title: string;
//   streamer: string;
//   viewers: string;
//   thumbnail: string;
// };

export function LiveSection() {
    const navigate = useNavigate();
  const [liveStreams, setLiveStreams] = useState<any[]>([]);
  const [fetchError, setFetchError] = useState(false);




  const fetchIhrStreams = async () => {
    try {
      const response = await fetch(`${ApiStrings.API_BASE_URL}/livepeer/1hr-playback`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setLiveStreams(data);
      setFetchError(false);
      console.log(data, 'Fetched 1hr playback streams');
    } catch (error) {
      setFetchError(true);
      setLiveStreams([]);
      console.error('Error fetching 1hr playback streams:', error);
    }
  }

  useEffect(() => {
    fetchIhrStreams();
    // Only run once on mount
  }, []);

  return (
    <section className="bg-lime-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <img src="../public/assets/live.png" />
          <h2 className="text-gray-800 text-8xl font-normal font-Redaction">live</h2>
        </div>
        {fetchError || liveStreams.length === 0 ? (
          <div className="text-center text-gray-500 text-xl py-12">No live available</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {liveStreams.map((stream) => (
              <div key={stream} onClick={() => navigate(`/stream/${stream.streamPlaybackId}`)}>
                <StreamCard
                  {...stream}
                  title={stream.name || stream.title}
                  isLive={true}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}