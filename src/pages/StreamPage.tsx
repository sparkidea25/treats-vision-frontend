import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { useEffect, useState } from 'react';
import { ApiStrings } from '@/lib/apiStrings';
import { EnableVideoIcon, StopIcon } from "@livepeer/react/assets";
import * as Broadcast from "@livepeer/react/broadcast";
import { getIngest } from "@livepeer/react/external";
import { useLocation } from 'react-router-dom';
import ChatRoom from '@/components/ChatRoom';
import { usePrivy } from '@privy-io/react-auth';
import { io } from 'socket.io-client';

const socket = io(process.env.VITE_API_LINK)
const StreamingPage = () => {
  const { user, authenticated } = usePrivy();
  console.log(user, 'user in streaming page');
    const [streamId, setStreamId] = useState(null);
    const [streamName, setStreamName]= useState('null')
        const [userId, setUserId]= useState('null')
      const location = useLocation();
  const form = location.state;


  useEffect(() => {
    const fetchStream = async () => {
      console.log(form, 'check form data');
      const streamDetails = await LiveStream(form);
      console.log(streamDetails.data, 'stream Details already')
      // if (streamDetails && streamDetails.data && streamDetails.data.id) {
        setStreamId(streamDetails.data.streamKey);
        setStreamName(streamDetails.data.name)
      // }
    }
     fetchStream();
  }, []);

  const getUserUserId = async (privyId: string) => {
    const fetchUser = await fetch(`${ApiStrings.API_BASE_URL}/livepeer/stream/${privyId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const userData = await fetchUser.json();
    return userData;
  }

  useEffect(() => {
    if (authenticated && user) {

      const getId =  getUserUserId(user.id)

      setUserId(getId.id);
      console.log('User authenticated:', user.id);
    } else {
      console.log('User not authenticated');
    }
}, [user]);

  console.log(userId, 'current user id here')

  // socket.emit("joinRoom", { roomId: streamId, user: userId });
   useEffect(() => {
    if (!userId || !streamId) return;
    socket.emit('joinRoom', { roomId: streamId, user: userId });
  }, [userId, streamId]);

  // console.log(user.id, 'user id here')

            // socket.emit('joinRoom', { streamId, user.id });

  //step one, get privyId, check with internal api if id a user and return user data


const LiveStream = async (form: any) => {
  try {
    const response = await fetch(`${ApiStrings.API_BASE_URL}/livepeer/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // Add body if required by your API, e.g.:
      body: JSON.stringify({ name: form.title || "stream - treatsvision ama",
        description: form.description,
        source: form.source,
        tokenAddress: form.tokenAddress,
        requiredTokens: form.tokenAmount, 
        tvChat: form.tvChat,
        tokenAccess: form.tokenAccess,
        publicAccess: form.publicAccess,
        privy_id: user.id || null, // Ensure privy_id is passed correctly
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    // const streamDetails = await response.json();
    // return response;
    const streamDetails = await response.json();
    return streamDetails;
  } catch (error) {
    console.error('Error creating stream:', error);
    return null;
  }
};


  return (
    <div className="min-h-screen bg-gray-100">
      {/* Updated Header - Now fully clickable as button */}
      <Header />

      {/* Main Content */}
      <div className="flex h-screen">
        {/* Video Stream Area */}
        <div className="flex-1 bg-green-50 relative">
          {/* Video placeholder with futuristic overlay https://gist.github.com/sparkidea25/03209b2d179be4886737d79f45029a58 */}
          {/* <BroadcastWithControls streamKey={streamId} /> */}
              <Broadcast.Root ingestUrl={getIngest(streamId)}>
      <Broadcast.Container className="h-full w-full bg-gray-950">
        <Broadcast.Video title={streamName} className="h-full w-full" />

        <Broadcast.Controls className="flex items-center justify-center">
          <Broadcast.EnabledTrigger className="w-10 h-10 hover:scale-105 flex-shrink-0">
            <Broadcast.EnabledIndicator asChild matcher={false}>
              <EnableVideoIcon className="w-full h-full" />
            </Broadcast.EnabledIndicator>
            <Broadcast.EnabledIndicator asChild>
              <StopIcon className="w-full h-full" />
            </Broadcast.EnabledIndicator>
          </Broadcast.EnabledTrigger>
        </Broadcast.Controls>

        <Broadcast.LoadingIndicator asChild matcher={false}>
          <div className="absolute overflow-hidden py-1 px-2 rounded-full top-1 left-1 bg-white/50 flex items-center backdrop-blur">
            <Broadcast.StatusIndicator
              matcher="live"
              className="flex gap-2 items-center"
            >
              <div className="bg-red-500 animate-pulse h-1.5 w-1.5 rounded-full" />
              <span className="text-xs text-white select-none">LIVE</span>
            </Broadcast.StatusIndicator>

            <Broadcast.StatusIndicator
              className="flex gap-2 items-center"
              matcher="pending"
            >
              <div className="bg-white/80 h-1.5 w-1.5 rounded-full animate-pulse" />
              <span className="text-xs select-none">LOADING</span>
            </Broadcast.StatusIndicator>

            <Broadcast.StatusIndicator
              className="flex gap-2 items-center"
              matcher="idle"
            >
              <div className="bg-white/80 h-1.5 w-1.5 rounded-full" />
              <span className="text-xs select-none">IDLE</span>
            </Broadcast.StatusIndicator>
          </div>
        </Broadcast.LoadingIndicator>
      </Broadcast.Container>
    </Broadcast.Root>
              </div>
              <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2">
              <button className="bg-green-50 rounded-full font-semibold backdrop-blur-sm border border-white border-opacity-30 transition-all">
                tip
              </button>
            </div>

            {/* Stream title overlay */}
            <div className="absolute bottom-8 left-8 text-blue">
              {/* <h1 className="text-3xl text-black font-bold mb-2">{form.name}</h1> */}
              {/* <p className="text-black">{form.description}</p> */}
            </div>

          {/* Chat Sidebar */}
          <ChatRoom />

      </div>
      <div className="w-screen border-t border-gray-800"></div>

      {/* Footer */}
      <Footer />
      {/* <div className="bg-white border-t border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-6 flex justify-center space-x-8">
          <button className="text-gray-600 hover:text-gray-900 text-sm">about</button>
          <button className="text-gray-600 hover:text-gray-900 text-sm">privacy policy</button>
        </div>
      </div> */}
    </div>
  );
};

export default StreamingPage;