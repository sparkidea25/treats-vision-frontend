import { useEffect, useState } from 'react';
import { StreamCard } from './StreamCard';
import { ApiStrings } from '@/lib/apiStrings';

// type LiveStream = {
//   title: string;
//   streamer: string;
//   viewers: string;
//   thumbnail: string;
// };

export function LiveSection() {
  const [liveStreams, setLiveStreams] = useState<any[]>([]);



  const fetchIhrStreams = async () => {
    try {
      const response = await fetch(`${ApiStrings.API_BASE_URL}/livepeer/1hr-playback`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setLiveStreams(data);
      console.log(data, 'Fetched 1hr playback streams');
    } catch (error) {
      console.error('Error fetching 1hr playback streams:', error);
    }
  }

  useEffect(() => {
    fetchIhrStreams();
    
  })

  return (
    <section className="bg-green-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-gray-800 text-6xl font-light">live</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {liveStreams.map((stream, index) => (
            <div key={index}>
              <StreamCard
                {...stream}
                title={stream.name || stream.title}
                isLive={true}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}