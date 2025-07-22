import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { useEffect, useState } from 'react';
import { ApiStrings } from '@/lib/apiStrings';
import { EnableVideoIcon, StopIcon } from "@livepeer/react/assets";
import * as Broadcast from "@livepeer/react/broadcast";
import { getIngest } from "@livepeer/react/external";
import { useLocation } from 'react-router-dom';
import ChatRoom from '@/components/ChatRoom';
import { io } from 'socket.io-client';
import { ToastContainer, toast } from 'react-toastify';

const socket = io(process.env.VITE_API_LINK)
const StreamingPage = () => {
    const [streamId, setStreamId] = useState("");
    const [streamName, setStreamName]= useState("")
      const location = useLocation();
  const form = location.state;
  console.log(form, 'form data from location state');


useEffect(() => {
  const fetchStream = async () => {
    console.log(form, 'check form data');
    const streamDetails = await LiveStream(form);
    if (streamDetails && streamDetails.data) {
      setStreamId(streamDetails.data.streamKey);
      setStreamName(streamDetails.data.name);
    } else {
      // toast.error('Failed to create stream or get stream details. Redirecting to home...');
      // setTimeout(() => {
      //   window.location.href = '/';
      // }, 2500);
      console.error('Failed to create stream or get stream details');
    }
  };
  fetchStream();
}, []);





  // console.log(userId, 'current user id here')

  // socket.emit("joinRoom", { roomId: streamId, user: userId });
   useEffect(() => {
    if (!form.userId || !streamId) return;
    socket.emit('joinRoom', { roomId: streamId, user: form.userId });
  }, [form.userId, streamId]);
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
        privy_id: form.userId, // Ensure privy_id is passed correctly
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
      <ToastContainer />
      {/* Updated Header - Now fully clickable as button */}
      <Header />

      {/* Main Content */}
      <div className="flex h-screen">
        {/* Video Stream Area */}
        <div className="flex-1 bg-lime-50 relative">
          {/* Video placeholder with futuristic overlay https://gist.github.com/sparkidea25/03209b2d179be4886737d79f45029a58 */}
          {/* <BroadcastWithControls streamKey={streamId} /> */}
          <Broadcast.Root ingestUrl={getIngest(streamId)}>
            <Broadcast.Container className="h-full w-full bg-gray-950">
              <Broadcast.Video title={streamName} className="h-full w-full"  style={{
                height: "100%",
                width: "100%",
                objectFit: "contain",
              }} />

              <Broadcast.Controls className="flex items-center justify-center">
                <Broadcast.EnabledTrigger className="w-10 h-10 hover:scale-105 flex-shrink-0 border-2 border-purple-500 rounded-full transition-transform duration-200">
                  <Broadcast.EnabledIndicator asChild matcher={false}>
                    <EnableVideoIcon
                      className="w-full h-full"
                      style={{
                        background: '#fff',
                        // border: '2px solid #a855f7', // purple-500
                        transition: 'background 0.2s, color 0.2s',
                        // color: '#a855f7',
                        boxSizing: 'border-box',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = '#000';
                        e.currentTarget.style.color = '#000';
                        e.currentTarget.style.border = '2px solid #a855f7'; // purple-500
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = '#000';
                        e.currentTarget.style.color = '#fff';
                        e.currentTarget.style.border = '2px solid #a855f7'; // purple-500
                      }}
                    />
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
          <br/>
          <div className="flex flex-col justify-center items-center absolute bottom-4 left-0 right-0">
            <button className="bg-pink-50 rounded-full font-semibold backdrop-blur-sm border-2 border-gray-800 px-6 py-2 transition-all shadow-sm">
    tip
  </button>
          <h1 className="text-black text-3xl font-FiraMono text-center">{form.title}</h1>
                    <p className="text-black text-center">{form.description}</p>
          </div>

        </div>
        <ChatRoom streamId={streamId} />

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