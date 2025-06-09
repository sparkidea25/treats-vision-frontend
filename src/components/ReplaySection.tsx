import { StreamCard } from './StreamCard';

export function ReplaySection() {
  const replayStreams = [
    {
      title: "Ernie's 24/7br Livestream",
      streamer: "Exile", 
      viewers: "500",
      thumbnail: "https://images.pexels.com/photos/7688374/pexels-photo-7688374.jpeg?auto=compress&cs=tinysrgb&w=400",
    },
    {
      title: "Ernie's 24/7br Livestream",
      streamer: "Exile",
      viewers: "823", 
      thumbnail: "https://images.pexels.com/photos/7688374/pexels-photo-7688374.jpeg?auto=compress&cs=tinysrgb&w=400",
    },
    {
      title: "Ernie's 24/7br Livestream",
      streamer: "Exile",
      viewers: "1.1k",
      thumbnail: "https://images.pexels.com/photos/7688374/pexels-photo-7688374.jpeg?auto=compress&cs=tinysrgb&w=400",
    },
    {
      title: "Ernie's 24/7br Livestream", 
      streamer: "Exile",
      viewers: "967",
      thumbnail: "https://images.pexels.com/photos/7688374/pexels-photo-7688374.jpeg?auto=compress&cs=tinysrgb&w=400",
    },
    {
      title: "Ernie's 24/7br Livestream",
      streamer: "Exile", 
      viewers: "445",
      thumbnail: "https://images.pexels.com/photos/7688374/pexels-photo-7688374.jpeg?auto=compress&cs=tinysrgb&w=400",
    },
    {
      title: "Ernie's 24/7br Livestream",
      streamer: "Exile",
      viewers: "712",
      thumbnail: "https://images.pexels.com/photos/7688374/pexels-photo-7688374.jpeg?auto=compress&cs=tinysrgb&w=400",
    }
  ];

  return (
    <section className="bg-green-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-gray-800 text-6xl font-light">replay</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {replayStreams.map((stream, index) => (
            <StreamCard
              key={index}
              {...stream}
              isLive={true}
            />
          ))}
        </div>
      </div>
    </section>
  );
}