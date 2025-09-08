import { useParams } from 'react-router-dom';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { useState, useEffect } from 'react';
import TipModal from '@/components/TipModal';
import { LiveStreamCard } from '@/components/LiveStream';
import ChatRoom from '@/components/ChatRoom';
import { ToastContainer } from 'react-toastify';
import { ApiStrings } from '@/lib/apiStrings';
import { fetchUsername } from '@/lib/utils';


const PlayerPage = () => {
  const { playbackId } = useParams<{ playbackId: string }>();
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [username, setUsername] = useState("");
  const [tipModalOpen, setTipModalOpen] = useState(false);
  const [streamInfo, setStreamInfo] = useState({
    title: "title",
    streamer: "Unknown Streamer",
    description: "Live stream playback",
    viewers: Math.floor(Math.random() * 100) + 1,
    isLive: false // Default to false to show "Stream Ended" initially
  });
  const [loading, setLoading] = useState(true);

  console.log(streamInfo, 'streamInfo state');

  useEffect(() => {
  if (!playbackId) return;

  let intervalId: NodeJS.Timeout;

  const fetchStreamInfo = async () => {
    try {
      // Fetch stream info
      const response = await fetch(`${ApiStrings.API_BASE_URL}/livepeer/stream-by/${playbackId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          "ngrok-skip-browser-warning": 'true',
        }
      });

      let data: any = {};
      let fetchedUsername = "";
      if (response.ok) {
        data = await response.json();
        if (data.userPrivyId) {
          try {
            fetchedUsername = await fetchUsername(data.userPrivyId);
            setUsername(fetchedUsername);
          } catch (error) {
            console.error("Error fetching username:", error);
          }
        }
      } else {
        console.warn('Failed to fetch stream info, using defaults');
      }

      // Fetch viewers count
      let viewers = 0;
      try {
        const viewersRes = await fetch(`${ApiStrings.API_BASE_URL}/livepeer/viewers/${playbackId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            "ngrok-skip-browser-warning": 'true',
          }
        });
        if (viewersRes.ok) {
          const viewersData = await viewersRes.json();
          viewers = viewersData.totalViews;
        }
      } catch (error) {
        console.error('Error fetching viewers:', error);
      }

      // Properly determine if stream is live
      const isStreamLive = !data.is_terminate;
      setStreamInfo(prevInfo => ({
        title: data.name || prevInfo.title,
        streamer: fetchedUsername || data.streamName || prevInfo.streamer,
        description: data.description || prevInfo.description,
        viewers: viewers,
        isLive: isStreamLive
      }));
    } catch (error) {
      console.error('Error fetching stream info:', error);
    } finally {
      setLoading(false);
    }
  };

  fetchStreamInfo();
  intervalId = setInterval(fetchStreamInfo, 30000);

  return () => {
    if (intervalId) clearInterval(intervalId);
  };
}, [playbackId]);

  // useEffect(() => {
  //   if (!playbackId) return;

  //   let intervalId: NodeJS.Timeout;

  //   const fetchStreamInfo = async () => {
  //     try {
  //       // Fetch stream info
  //       const response = await fetch(`${ApiStrings.API_BASE_URL}/livepeer/stream-by/${playbackId}`, {
  //         method: 'GET',
  //         headers: {
  //           'Content-Type': 'application/json',
  //           "ngrok-skip-browser-warning": 'true',
  //         }
  //       });

  //       let data: any = {};
  //       if (response.ok) {
  //         data = await response.json();
  //         console.log('Stream data:', data); // Debug log to see the actual response
          
  //         // Fetch username from the API response userPrivyId
  //         if (data.userPrivyId) {
  //           try {
  //             const fetchedUsername = await fetchUsername(data.userPrivyId);
  //             setUsername(fetchedUsername);
  //             console.log("Username set to:", fetchedUsername);
  //           } catch (error) {
  //             console.error("Error fetching username:", error);
  //           }
  //         }
  //       } else {
  //         console.warn('Failed to fetch stream info, using defaults');
  //       }

  //       // Fetch viewers count
  //       let viewers = 0;
  //       try {
  //         const viewersRes = await fetch(`${ApiStrings.API_BASE_URL}/livepeer/viewers/${playbackId}`, {
  //           method: 'GET',
  //           headers: {
  //             'Content-Type': 'application/json',
  //             "ngrok-skip-browser-warning": 'true',
  //           }
  //         });
  //         if (viewersRes.ok) {
  //           const viewersData = await viewersRes.json();
  //           viewers = viewersData.totalViews;
  //         }
  //       } catch (error) {
  //         console.error('Error fetching viewers:', error);
  //       }

  //       // Properly determine if stream is live
  //       // If is_terminate is false or undefined/null, stream is LIVE
  //       // If is_terminate is true, stream is ENDED
  //       const isStreamLive = !data.is_terminate;
  //       console.log('is_terminate:', data.is_terminate, 'isStreamLive:', isStreamLive); // Debug log

  //       setStreamInfo(prevInfo => ({
  //         title: data.name || prevInfo.title, // Use 'name' from API response
  //         streamer: username || data.streamName || prevInfo.streamer, // Use 'streamName' from API response
  //         description: data.description || prevInfo.description,
  //         viewers: viewers, // Use viewers from the viewers endpoint
  //         isLive: isStreamLive
  //       }));
  //     } catch (error) {
  //       console.error('Error fetching stream info:', error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchStreamInfo();
  //   intervalId = setInterval(fetchStreamInfo, 30000);

  //   return () => {
  //     if (intervalId) clearInterval(intervalId);
  //   };
  // }, [playbackId, username]);

  if (!playbackId) {
    return (
      <div className="min-h-screen bg-lime-50 flex items-center justify-center">
        <div className="text-center text-black text-xl">No playbackId provided.</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-lime-50 flex items-center justify-center">
        <div className="text-center text-black text-xl">Loading stream info...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-lime-50">
      <ToastContainer />
      
      {/* Header component */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-lime-50 border-b border-gray-800">
        <Header />
      </div>
      
      {/* Main Content Container */}
      <div className="pt-16">
        <div className="flex min-h-screen">
          {/* Video Stream Area */}
          <div className="flex-1 bg-lime-50 flex flex-col min-h-screen ml-8">
            {/* Live Stream Player */}
            <div className="flex-1 flex flex-col justify-center">
              <LiveStreamCard
                title={streamInfo.title}
                streamer={streamInfo.streamer}
                viewers={streamInfo.viewers}
                isLive={streamInfo.isLive}
                playbackId={playbackId}
              />
            </div>
            
            {/* Stream Info and Tip Button - below video */}
            <div className="flex flex-col justify-center items-center py-4">
              <button 
                className="group bg-pink-50 hover:bg-black text-black hover:text-white rounded-full font-semibold border-2 border-black hover:border-pink-500 px-2 py-2 text-lg shadow-[4px_6px_0_0_#000] hover:scale-105 transition-all mt-2"
                onClick={() => setTipModalOpen(true)}
                style={{ minWidth: '100px' }}
              >
                <span className="font-sans">tip</span>
              </button>
              <h1 className="text-black text-3xl font-FiraMono text-center mt-2">
                {streamInfo.title}
              </h1>
              <p className="text-black text-center">{streamInfo.description}</p>
              {/* Fixed the display logic - show "Live" when isLive is true, "Stream Ended" when false */}
              <p className="text-black text-sm text-center mt-1">
                Streamer: {streamInfo.streamer} • {streamInfo.viewers} viewers
                {streamInfo.isLive ? ' • Live' : ' • Stream Ended'}
              </p>
            </div>
            
            {/* Tip Modal Overlay */}
            <TipModal open={tipModalOpen} onClose={() => setTipModalOpen(false)} />
          </div>
          
          {/* Chat Room Component */}
          <div className="flex-shrink-0">
            <ChatRoom streamId={playbackId} onChatToggle={setIsChatOpen} />
          </div>
        </div>
        
        {/* Divider line */}
        <div className="ml-8 border-b border-gray-800"></div>
        {/* Footer */}
        <Footer />
      </div>
      
      {/* Vertical border line that spans entire height */}
      <div className="fixed inset-y-0 left-8 w-px bg-black z-50 pointer-events-none"></div>
      
      {/* Vertical border line between stream and chat - adjusts based on chat state */}
      <div 
        className="fixed inset-y-0 w-px bg-gray-800 z-50 pointer-events-none" 
        style={{ left: isChatOpen ? 'calc(100% - 320px)' : 'calc(100% - 64px)' }}
      ></div>
    </div>
  );
};

export default PlayerPage;